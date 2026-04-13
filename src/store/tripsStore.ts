import { create } from 'zustand';
import type { Trip, TripStep } from '../types/trip';
import {
  fetchTrips,
  saveTrip,
  removeTrip,
  getCachedTrips,
} from '../services/firestoreTrips';
import { auth } from '../services/firebase';
import { getCachedUser } from '../services/authService';

interface TripsState {
  trips: Trip[];
  loading: boolean;
  uid: string | null;
  setUid: (uid: string | null) => void;
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

  return {
    trips: [],
    loading: true,
    uid: null,

    setUid(uid: string | null) {
      set({ uid });
    },

    clear() {
      set({ trips: [], loading: false, uid: null });
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
      if (!uid) return;

      const withOwner = { ...trip, ownerUid: uid, collaboratorUids: [] };
      set((s) => ({ trips: [withOwner, ...s.trips] }));
      try {
        await saveTrip(uid, withOwner);
      } catch (error) {
        console.error('[tripsStore] addTrip Firestore error:', error);
      }
    },

    async updateTrip(trip: Trip) {
      const uid = resolveUid();
      if (!uid) return;

      const updated = { ...trip, updatedAt: new Date().toISOString() };
      set((s) => ({
        trips: s.trips.map((t) => (t.id === updated.id ? updated : t)),
      }));
      try {
        await saveTrip(uid, updated);
      } catch (error) {
        console.error('[tripsStore] updateTrip Firestore error:', error);
      }
    },

    async deleteTrip(id: string) {
      const uid = resolveUid();
      if (!uid) return;

      set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }));
      try {
        await removeTrip(uid, id);
      } catch (error) {
        console.error('[tripsStore] deleteTrip Firestore error:', error);
      }
    },

    async addStep(tripId: string, step: TripStep) {
      const uid = resolveUid();
      if (!uid) return;

      const trip = get().trips.find((t) => t.id === tripId);
      if (!trip) return;
      const updated = {
        ...trip,
        steps: [...trip.steps, step],
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({
        trips: s.trips.map((t) => (t.id === tripId ? updated : t)),
      }));
      try {
        await saveTrip(uid, updated);
      } catch (error) {
        console.error('[tripsStore] addStep Firestore error:', error);
      }
    },

    async updateStep(tripId: string, step: TripStep) {
      const uid = resolveUid();
      if (!uid) return;

      const trip = get().trips.find((t) => t.id === tripId);
      if (!trip) return;
      const updated = {
        ...trip,
        steps: trip.steps.map((s) => (s.id === step.id ? step : s)),
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({
        trips: s.trips.map((t) => (t.id === tripId ? updated : t)),
      }));
      try {
        await saveTrip(uid, updated);
      } catch (error) {
        console.error('[tripsStore] updateStep Firestore error:', error);
      }
    },

    async deleteStep(tripId: string, stepId: string) {
      const uid = resolveUid();
      if (!uid) return;

      const trip = get().trips.find((t) => t.id === tripId);
      if (!trip) return;
      const steps = trip.steps
        .filter((s) => s.id !== stepId)
        .map((s, i) => ({ ...s, order: i }));
      const updated = {
        ...trip,
        steps,
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({
        trips: s.trips.map((t) => (t.id === tripId ? updated : t)),
      }));
      try {
        await saveTrip(uid, updated);
      } catch (error) {
        console.error('[tripsStore] deleteStep Firestore error:', error);
      }
    },

    async reorderSteps(tripId: string, steps: TripStep[]) {
      const uid = resolveUid();
      if (!uid) return;

      const trip = get().trips.find((t) => t.id === tripId);
      if (!trip) return;
      const updated = {
        ...trip,
        steps,
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({
        trips: s.trips.map((t) => (t.id === tripId ? updated : t)),
      }));
      try {
        await saveTrip(uid, updated);
      } catch (error) {
        console.error('[tripsStore] reorderSteps Firestore error:', error);
      }
    },
  };
});
