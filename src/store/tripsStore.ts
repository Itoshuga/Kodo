import { create } from 'zustand';
import type { Trip, TripStep } from '../types/trip';
import {
  fetchTrips,
  saveTrip,
  removeTrip,
  getCachedTrips,
  setCachedTrips,
} from '../services/firestoreTrips';
import { auth } from '../services/firebase';
import { getCachedUser } from '../services/authService';

export type TripsSyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

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
      return 'Service temporairement indisponible. Reessayez dans quelques instants.';
    case 'deadline-exceeded':
      return 'La synchronisation a pris trop de temps. Reessayez.';
    default:
      break;
  }

  const raw = error instanceof Error ? error.message : '';
  const normalized = raw.toLowerCase();

  if (normalized.includes('unsupported field value')) {
    return 'Certaines donnees du trajet sont invalides. Verifiez les champs puis reessayez.';
  }
  if (normalized.includes('missing or insufficient permissions')) {
    return 'Permissions insuffisantes pour synchroniser vos modifications.';
  }
  if (normalized.includes('offline')) {
    return 'Vous etes hors ligne. Les modifications locales ont ete restaurees.';
  }

  return 'Echec de synchronisation. Vos modifications locales ont ete restaurees.';
}

interface TripsState {
  trips: Trip[];
  loading: boolean;
  uid: string | null;
  syncStatus: TripsSyncStatus;
  syncMessage: string | null;
  syncError: string | null;
  pendingWrites: number;
  setUid: (uid: string | null) => void;
  dismissSyncStatus: () => void;
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
      syncMessage: 'Echec de synchronisation',
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

    clear() {
      set({
        trips: [],
        loading: false,
        uid: null,
        syncStatus: 'idle',
        syncMessage: null,
        syncError: null,
        pendingWrites: 0,
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
        const message = 'Connexion requise pour creer un trajet.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const withOwner = { ...trip, ownerUid: uid, collaboratorUids: [] };
      const nextTrips = [withOwner, ...previousTrips];

      await runOptimisticMutation(
        'addTrip',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, withOwner),
        'Trajet sauvegarde'
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
      const updated = { ...trip, updatedAt: new Date().toISOString() };
      const nextTrips = previousTrips.map((t) => (t.id === updated.id ? updated : t));

      await runOptimisticMutation(
        'updateTrip',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Trajet mis a jour'
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
      const nextTrips = previousTrips.filter((t) => t.id !== id);

      await runOptimisticMutation(
        'deleteTrip',
        previousTrips,
        nextTrips,
        () => removeTrip(uid, id),
        'Trajet supprime'
      );
    },

    async addStep(tripId: string, step: TripStep) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour ajouter une etape.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const updated = {
        ...trip,
        steps: [...trip.steps, step],
        updatedAt: new Date().toISOString(),
      };
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'addStep',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Etape ajoutee'
      );
    },

    async updateStep(tripId: string, step: TripStep) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour modifier une etape.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const updated = {
        ...trip,
        steps: trip.steps.map((s) => (s.id === step.id ? step : s)),
        updatedAt: new Date().toISOString(),
      };
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'updateStep',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Etape modifiee'
      );
    },

    async deleteStep(tripId: string, stepId: string) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour supprimer une etape.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const steps = trip.steps
        .filter((s) => s.id !== stepId)
        .map((s, i) => ({ ...s, order: i }));
      const updated = {
        ...trip,
        steps,
        updatedAt: new Date().toISOString(),
      };
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'deleteStep',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Etape supprimee'
      );
    },

    async reorderSteps(tripId: string, steps: TripStep[]) {
      const uid = resolveUid();
      if (!uid) {
        const message = 'Connexion requise pour reordonner les etapes.';
        finishSyncError(message);
        throw new Error(message);
      }

      const previousTrips = get().trips;
      const trip = previousTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trajet introuvable.');
      }
      const updated = {
        ...trip,
        steps,
        updatedAt: new Date().toISOString(),
      };
      const nextTrips = previousTrips.map((t) => (t.id === tripId ? updated : t));

      await runOptimisticMutation(
        'reorderSteps',
        previousTrips,
        nextTrips,
        () => saveTrip(uid, updated),
        'Ordre des etapes enregistre'
      );
    },
  };
});
