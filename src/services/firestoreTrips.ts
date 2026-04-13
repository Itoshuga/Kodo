import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types/trip';

const COLLECTION = 'trips';
const CACHE_KEY = 'kodo_trips';

function cacheTrips(trips: Trip[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(trips));
  } catch { /* quota exceeded */ }
}

export function getCachedTrips(): Trip[] {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Trip[];
  } catch {
    return [];
  }
}

export async function fetchTrips(uid: string): Promise<Trip[]> {
  const ownQ = query(
    collection(db, COLLECTION),
    where('uid', '==', uid)
  );

  let collabSnap;
  const ownSnap = await getDocs(ownQ);

  try {
    const collabQ = query(
      collection(db, COLLECTION),
      where('collaboratorUids', 'array-contains', uid)
    );
    collabSnap = await getDocs(collabQ);
  } catch {
    collabSnap = null;
  }

  const seen = new Set<string>();
  const trips: Trip[] = [];

  for (const d of ownSnap.docs) {
    const data = d.data();
    const { uid: _uid, ...rest } = data;
    const trip = rest as Trip;
    seen.add(trip.id);
    trips.push(trip);
  }

  if (collabSnap) {
    for (const d of collabSnap.docs) {
      const data = d.data();
      const { uid: _uid, ...rest } = data;
      const trip = rest as Trip;
      if (!seen.has(trip.id)) {
        trips.push(trip);
      }
    }
  }

  trips.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  cacheTrips(trips);
  return trips;
}

export async function saveTrip(uid: string, trip: Trip): Promise<void> {
  const toSave = {
    ...trip,
    uid,
    ownerUid: trip.ownerUid || uid,
    collaboratorUids: trip.collaboratorUids || [],
  };
  await setDoc(doc(db, COLLECTION, trip.id), toSave);
  const cached = getCachedTrips();
  const idx = cached.findIndex((t) => t.id === trip.id);
  if (idx >= 0) {
    cached[idx] = trip;
  } else {
    cached.unshift(trip);
  }
  cacheTrips(cached);
}

export async function removeTrip(_uid: string, tripId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, tripId));
  const cached = getCachedTrips().filter((t) => t.id !== tripId);
  cacheTrips(cached);
}
