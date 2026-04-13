import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
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

function toTrip(data: DocumentData): Trip {
  const { uid: _legacyUid, ...rest } = data;
  return rest as Trip;
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefinedDeep(v)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

function pushUniqueTrip(
  target: Trip[],
  seen: Set<string>,
  docSnap: QueryDocumentSnapshot<DocumentData>
): void {
  const trip = toTrip(docSnap.data());
  if (seen.has(trip.id)) return;
  seen.add(trip.id);
  target.push(trip);
}

export async function fetchTrips(uid: string): Promise<Trip[]> {
  const ownQ = query(collection(db, COLLECTION), where('ownerUid', '==', uid));
  const ownSnap = await getDocs(ownQ);

  let collabSnap;
  let legacyOwnSnap = null;

  try {
    const collabQ = query(
      collection(db, COLLECTION),
      where('collaboratorUids', 'array-contains', uid)
    );
    collabSnap = await getDocs(collabQ);
  } catch {
    collabSnap = null;
  }

  try {
    const legacyOwnQ = query(collection(db, COLLECTION), where('uid', '==', uid));
    legacyOwnSnap = await getDocs(legacyOwnQ);
  } catch {
    legacyOwnSnap = null;
  }

  const seen = new Set<string>();
  const trips: Trip[] = [];

  for (const d of ownSnap.docs) {
    pushUniqueTrip(trips, seen, d);
  }

  if (legacyOwnSnap) {
    for (const d of legacyOwnSnap.docs) {
      pushUniqueTrip(trips, seen, d);
    }
  }

  if (collabSnap) {
    for (const d of collabSnap.docs) {
      pushUniqueTrip(trips, seen, d);
    }
  }

  trips.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  cacheTrips(trips);
  return trips;
}

export async function saveTrip(uid: string, trip: Trip): Promise<void> {
  const cached = getCachedTrips();
  const idx = cached.findIndex((t) => t.id === trip.id);
  if (idx >= 0) {
    cached[idx] = trip;
  } else {
    cached.unshift(trip);
  }
  cacheTrips(cached);

  const toSave = stripUndefinedDeep({
    ...trip,
    ownerUid: trip.ownerUid || uid,
    collaboratorUids: trip.collaboratorUids || [],
  });
  await setDoc(doc(db, COLLECTION, trip.id), toSave);
}

export async function removeTrip(_uid: string, tripId: string): Promise<void> {
  const cached = getCachedTrips().filter((t) => t.id !== tripId);
  cacheTrips(cached);
  await deleteDoc(doc(db, COLLECTION, tripId));
}
