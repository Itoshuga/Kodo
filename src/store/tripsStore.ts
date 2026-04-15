import { create } from 'zustand';
import type { Trip, TripActivityAction, TripActivityEntry, TripStep } from '../types/trip';
import {
  fetchTrips,
  saveTrip,
  removeTrip,
  getCachedTrips,
  setCachedTrips,
} from '../services/firestoreTrips';
import { auth } from '../services/firebase';
import { getCachedUser } from '../services/authService';
import { generateId } from '../utils/ids';

export type TripsSyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

const ACTIVITY_LOG_LIMIT = 80;
const UNDO_WINDOW_MS = 10000;

interface UndoTripDeletion {
  kind: 'trip';
  trip: Trip;
  message: string;
  expiresAt: number;
}

interface UndoStepDeletion {
  kind: 'step';
  tripBeforeDelete: Trip;
  tripId: string;
  stepId: string;
  stepTitle: string;
  message: string;
  expiresAt: number;
}

export type PendingUndoDeletion = UndoTripDeletion | UndoStepDeletion;
type PendingUndoPayload =
  | Omit<UndoTripDeletion, 'expiresAt'>
  | Omit<UndoStepDeletion, 'expiresAt'>;

function getSyncErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code || '')
    : '';

  switch (code) {
    case 'permission-denied':
      return 'Permissions insuffisantes pour synchroniser vos modifications.';
    case 'unauthenticated':
      return 'Connexion requise pour synchroniser vos modifications.';
    case 'unavailable':
      return 'Service temporairement indisponible. Réessayez dans quelques instants.';
    case 'deadline-exceeded':
      return 'La synchronisation a pris trop de temps. Réessayez.';
    default:
      break;
  }

  const raw = error instanceof Error ? error.message : '';
  const normalized = raw.toLowerCase();

  if (normalized.includes('unsupported field value')) {
    return 'Certaines données du trajet sont invalides. Vérifiez les champs puis réessayez.';
  }
  if (normalized.includes('missing or insufficient permissions')) {
    return 'Permissions insuffisantes pour synchroniser vos modifications.';
  }
  if (normalized.includes('offline')) {
    return 'Vous êtes hors ligne. Les modifications locales ont été restaurées.';
  }

  return 'Échec de synchronisation. Vos modifications locales ont été restaurées.';
}

interface TripsState {
  trips: Trip[];
  loading: boolean;
  uid: string | null;
  syncStatus: TripsSyncStatus;
  syncMessage: string | null;
  syncError: string | null;
  pendingWrites: number;
  pendingUndo: PendingUndoDeletion | null;
  undoInProgress: boolean;
  setUid: (uid: string | null) => void;
  dismissSyncStatus: () => void;
  dismissUndo: () => void;
  undoLastDeletion: () => Promise<void>;
  loadTrips: () => Promise<void>;
  addTrip: (trip: Trip) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addStep: (tripId: string, step: TripStep) => Promise<void>;
  updateStep: (tripId: string, step: TripStep) => Promise<void>;
  deleteStep: (tripId: string, stepId: string) => Promise<void>;
  reorderSteps: (tripId: string, steps: TripStep[]) => Promise<void>;
  clear: () => void;
}

export const useTripsStore = create<TripsState>((set, get) => {
  const resolveUid = (): string | null => {
    const stateUid = get().uid;
    if (stateUid) return stateUid;

    const authUid = auth.currentUser?.uid ?? null;
    if (authUid) {
      set({ uid: authUid });
      return authUid;
    }

    const cachedUid = getCachedUser()?.uid ?? null;
    if (cachedUid) {
      set({ uid: cachedUid });
      return cachedUid;
    }

    return null;
  };

  const resolveActor = () => {
    const cached = getCachedUser();
    const actorUid = auth.currentUser?.uid ?? cached?.uid ?? undefined;
    const actorName =
      auth.currentUser?.displayName?.trim() ||
      cached?.username?.trim() ||
      cached?.email?.trim() ||
      undefined;

    return { actorUid, actorName };
  };

  const createActivity = (
    action: TripActivityAction,
    options?: { stepId?: string; stepTitle?: string }
  ): TripActivityEntry => {
    const { actorUid, actorName } = resolveActor();

    return {
      id: generateId(),
      action,
      createdAt: new Date().toISOString(),
      actorUid,
      actorName,
      stepId: options?.stepId,
      stepTitle: options?.stepTitle,
    };
  };

  const appendActivity = (trip: Trip, entry: TripActivityEntry): Trip => {
    const current = Array.isArray(trip.activityLog) ? trip.activityLog : [];
    const nextLog = [...current, entry];

    if (nextLog.length > ACTIVITY_LOG_LIMIT) {
      nextLog.splice(0, nextLog.length - ACTIVITY_LOG_LIMIT);
    }

    return {
      ...trip,
      activityLog: nextLog,
    };
  };

  const queueUndo = (payload: PendingUndoPayload) => {
    const expiresAt = Date.now() + UNDO_WINDOW_MS;
    const pendingUndo: PendingUndoDeletion =
      payload.kind === 'trip'
        ? { ...payload, expiresAt }
        : { ...payload, expiresAt };

    set({
      pendingUndo,
    });
  };

  const startSync = () => {
    set((state) => ({
      pendingWrites: state.pendingWrites + 1,
      syncStatus: 'syncing',
      syncMessage: 'Synchronisation en cours...',
      syncError: null,
    }));
  };

  const finishSyncSuccess = (message: string) => {
    set((state) => {
      const pendingWrites = Math.max(0, state.pendingWrites - 1);
      if (pendingWrites > 0) {
        return { pendingWrites };
      }
      return {
        pendingWrites: 0,
        syncStatus: 'saved',
        syncMessage: message,
        syncError: null,
      };
    });
  };

  const finishSyncError = (errorMessage: string) => {
    set({
      pendingWrites: 0,
      syncStatus: 'error',
      syncMessage: 'Échec de synchronisation',
      syncError: errorMessage,
    });
  };

  const rollbackTrips = (previousTrips: Trip[]) => {
    set({ trips: previousTrips });
    setCachedTrips(previousTrips);
  };

  const runOptimisticMutation = async (
    operationName: string,
    previousTrips: Trip[],
    nextTrips: Trip[],
    remoteMutation: () => Promise<void>,
    successMessage: string
  ) => {
    startSync();
    set({ trips: nextTrips });
    try {
      await remoteMutation();
      finishSyncSuccess(successMessage);
    } catch (error) {
      rollbackTrips(previousTrips);
      const message = getSyncErrorMessage(error);
      finishSyncError(message);
      console.error(`[tripsStore] ${operationName} Firestore error:`, error);
      throw new Error(message);
    }
  };

  return {
    trips: [],
    loading: true,
    uid: null,
    syncStatus: 'idle',
    syncMessage: null,
    syncError: null,
    pendingWrites: 0,
    pendingUndo: null,
    undoInProgress: false,

    setUid(uid: string | null) {
      set({ uid });
    },

    dismissSyncStatus() {
      set((state) => {
        if (state.syncStatus === 'syncing') return {};
        return {
          syncStatus: 'idle',
          syncMessage: null,
          syncError: null,
        };
      });
    },

    dismissUndo() {
      set({ pendingUndo: null, undoInProgress: false });
    },

    async undoLastDeletion() {
      const pendingUndo = get().pendingUndo;
      if (!pendingUndo || get().undoInProgress) return;

      if (Date.now() > pendingUndo.expiresAt) {
        set({ pendingUndo: null, undoInProgress: false });
        return;
      }

      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour annuler la suppression.';
        finishSyncError(message);
        throw new Error(message);
      }

      set({ undoInProgress: true });

      try {
        if (pendingUndo.kind === 'trip') {
          const restoredBase: Trip = {
            ...pendingUndo.trip,
            updatedAt: new Date().toISOString(),
          };
          const restoredTrip = appendActivity(
            restoredBase,
            createActivity('trip_restored')
          );

          const previousTrips = get().trips;
          const nextTrips = [
            restoredTrip,
            ...previousTrips.filter((trip) => trip.id !== restoredTrip.id),
          ];

          await runOptimisticMutation(
            'undoDeleteTrip',
            previousTrips,
            nextTrips,
            () => saveTrip(uid, restoredTrip),
            'Suppression annulée'
          );

          set({ pendingUndo: null });
          return;
        }

        const restoredStep = pendingUndo.tripBeforeDelete.steps.find(
          (step) => step.id === pendingUndo.stepId
        );
        const restoredBase: Trip = {
          ...pendingUndo.tripBeforeDelete,
          updatedAt: new Date().toISOString(),
        };
        const restoredTrip = appendActivity(
          restoredBase,
          createActivity('step_restored', {
            stepId: pendingUndo.stepId,
            stepTitle: restoredStep?.title || pendingUndo.stepTitle,
          })
        );

        const previousTrips = get().trips;
        const hasTrip = previousTrips.some((trip) => trip.id === pendingUndo.tripId);
        const nextTrips = hasTrip
          ? previousTrips.map((trip) => (trip.id === pendingUndo.tripId ? restoredTrip : trip))
          : [restoredTrip, ...previousTrips];

        await runOptimisticMutation(
          'undoDeleteStep',
          previousTrips,
          nextTrips,
          () => saveTrip(uid, restoredTrip),
          'Suppression annulée'
        );

        set({ pendingUndo: null });
      } finally {
        set({ undoInProgress: false });
      }
    },

    clear() {
      set({
        trips: [],
        loading: false,
        uid: null,
        syncStatus: 'idle',
        syncMessage: null,
        syncError: null,
        pendingWrites: 0,
        pendingUndo: null,
        undoInProgress: false,
      });
    },

    async loadTrips() {
      const uid = resolveUid();
      if (!uid) {
        set({ trips: [], loading: false });
        return;
      }

      const cached = getCachedTrips();
      if (cached.length > 0) {
        set({ trips: cached, loading: false });
      }

      try {
        const trips = await fetchTrips(uid);
        set({ trips, loading: false });
      } catch {
        if (cached.length > 0) {
          set({ trips: cached, loading: false });
        } else {
          set({ loading: false });
        }
      }
    },

    async addTrip(trip: Trip) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour créer un trajet.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const withOwner = appendActivity(
        {
          ...trip,
          ownerUid: uid,
          collaboratorUids: [],
        },
        createActivity('trip_created')
      );
      const nextTrips = [withOwner, ...previousTrips];

      await runOptimisticMutation(
        'addTrip',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, withOwner),
        'Trajet sauvegardé'
      );
    },

    async updateTrip(trip: Trip) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour modifier un trajet.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const updated = appendActivity(
        { ...trip, updatedAt: new Date().toISOString() },
        createActivity('trip_updated')
      );
      const nextTrips = previousTrips.map((t) => (t.id === updated.id ? updated : t));

      await runOptimisticMutation(
        'updateTrip',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Trajet mis à jour'
      );
    },

    async deleteTrip(id: string) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour supprimer un trajet.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const deletedTrip = previousTrips.find((trip) => trip.id === id);
      if (!deletedTrip) {
        throw new Error('Trajet introuvable.');
      }
      const nextTrips = previousTrips.filter((trip) => trip.id !== id);

      await runOptimisticMutation(
        'deleteTrip',
        previousTrips,
        nextTrips,
        () => removeTrip(uid, id),
        'Trajet supprimé'
      );

      queueUndo({
        kind: 'trip',
        trip: deletedTrip,
        message: `Trajet "${deletedTrip.title}" supprimé.`,
      });
    },

    async addStep(tripId: string, step: TripStep) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour ajouter une étape.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const updated = appendActivity(
        {
          ...trip,
          steps: [...trip.steps, step],
          updatedAt: new Date().toISOString(),
        },
        createActivity('step_added', {
          stepId: step.id,
          stepTitle: step.title,
        })
      );
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'addStep',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Étape ajoutée'
      );
    },

    async updateStep(tripId: string, step: TripStep) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour modifier une étape.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const updated = appendActivity(
        {
          ...trip,
          steps: trip.steps.map((s) => (s.id === step.id ? step : s)),
          updatedAt: new Date().toISOString(),
        },
        createActivity('step_updated', {
          stepId: step.id,
          stepTitle: step.title,
        })
      );
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'updateStep',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Étape modifiée'
      );
    },

    async deleteStep(tripId: string, stepId: string) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour supprimer une étape.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const deletedStep = trip.steps.find((step) => step.id === stepId);
      const steps = trip.steps
        .filter((s) => s.id !== stepId)
        .map((s, i) => ({ ...s, order: i }));
      const updated = appendActivity(
        {
          ...trip,
          steps,
          updatedAt: new Date().toISOString(),
        },
        createActivity('step_deleted', {
          stepId,
          stepTitle: deletedStep?.title || `Étape ${deletedStep?.order ?? ''}`.trim(),
        })
      );
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'deleteStep',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Étape supprimée'
      );

      queueUndo({
        kind: 'step',
        tripBeforeDelete: trip,
        tripId,
        stepId,
        stepTitle: deletedStep?.title || 'Étape',
        message: `Étape "${deletedStep?.title || 'Sans titre'}" supprimée.`,
      });
    },

    async reorderSteps(tripId: string, steps: TripStep[]) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour réordonner les étapes.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const updated = appendActivity(
        {
          ...trip,
          steps,
          updatedAt: new Date().toISOString(),
        },
        createActivity('steps_reordered')
      );
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'reorderSteps',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Ordre des étapes enregistré'
      );
    },
  };
});
