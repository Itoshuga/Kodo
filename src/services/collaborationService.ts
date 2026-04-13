import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { TripInvite, TripCollaborator } from '../types/collaboration';
import type { UserProfile } from './authService';
import { generateId } from '../utils/ids';

const INVITES = 'invites';
const TRIPS = 'trips';
const USERS = 'users';

export async function sendInvite(
  tripId: string,
  tripTitle: string,
  fromUser: UserProfile,
  toEmail: string
): Promise<TripInvite> {
  const normalizedEmail = toEmail.toLowerCase().trim();
  const rawEmail = toEmail.trim();

  let targetUser: UserProfile | undefined;

  // Prefer normalized indexable field when available.
  try {
    const byLowerQ = query(
      collection(db, USERS),
      where('emailLower', '==', normalizedEmail)
    );
    const byLowerSnap = await getDocs(byLowerQ);
    targetUser = byLowerSnap.docs[0]?.data() as UserProfile | undefined;
  } catch {
    targetUser = undefined;
  }

  // Backward-compatible fallback for existing users docs.
  if (!targetUser) {
    const byExactQ = query(
      collection(db, USERS),
      where('email', '==', normalizedEmail)
    );
    const byExactSnap = await getDocs(byExactQ);
    targetUser = byExactSnap.docs[0]?.data() as UserProfile | undefined;
  }
  if (!targetUser && rawEmail !== normalizedEmail) {
    const byRawQ = query(
      collection(db, USERS),
      where('email', '==', rawEmail)
    );
    const byRawSnap = await getDocs(byRawQ);
    targetUser = byRawSnap.docs[0]?.data() as UserProfile | undefined;
  }

  if (!targetUser?.uid) {
    throw new Error("Aucun compte n'est associé à cet email.");
  }

  const invite: TripInvite = {
    id: generateId(),
    tripId,
    tripTitle,
    fromUid: fromUser.uid,
    fromUsername: fromUser.username,
    toEmail: normalizedEmail,
    toUid: targetUser.uid,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, INVITES, invite.id), invite);
  return invite;
}

export async function fetchInvitesForUser(email: string): Promise<TripInvite[]> {
  const q = query(
    collection(db, INVITES),
    where('toEmail', '==', email.toLowerCase().trim())
  );
  const snap = await getDocs(q);
  const invites = snap.docs
    .map((d) => d.data() as TripInvite)
    .filter((invite) => invite.status === 'pending');
  invites.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return invites;
}

export function subscribePendingInvitesForUser(
  email: string,
  onInvites: (invites: TripInvite[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, INVITES),
    where('toEmail', '==', email.toLowerCase().trim())
  );

  return onSnapshot(
    q,
    (snap) => {
      const invites = snap.docs
        .map((d) => d.data() as TripInvite)
        .filter((invite) => invite.status === 'pending');
      invites.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onInvites(invites);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function fetchInvitesForTrip(tripId: string): Promise<TripInvite[]> {
  const q = query(
    collection(db, INVITES),
    where('tripId', '==', tripId)
  );
  const snap = await getDocs(q);
  const invites = snap.docs.map((d) => d.data() as TripInvite);
  invites.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return invites;
}

export async function acceptInvite(invite: TripInvite, uid: string): Promise<void> {
  await updateDoc(doc(db, INVITES, invite.id), {
    status: 'accepted',
    toUid: uid,
  });

  await updateDoc(doc(db, TRIPS, invite.tripId), {
    collaboratorUids: arrayUnion(uid),
  });
}

export async function declineInvite(inviteId: string): Promise<void> {
  await updateDoc(doc(db, INVITES, inviteId), {
    status: 'declined',
  });
}

export async function removeCollaborator(tripId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, TRIPS, tripId), {
    collaboratorUids: arrayRemove(uid),
  });

  const invQ = query(
    collection(db, INVITES),
    where('tripId', '==', tripId),
    where('toUid', '==', uid)
  );
  const snap = await getDocs(invQ);
  for (const d of snap.docs) {
    await deleteDoc(doc(db, INVITES, d.id));
  }
}

export async function revokeInvite(inviteId: string): Promise<void> {
  await deleteDoc(doc(db, INVITES, inviteId));
}

export async function fetchCollaborators(
  ownerUid: string,
  collaboratorUids: string[]
): Promise<TripCollaborator[]> {
  const collabs: TripCollaborator[] = [];

  const ownerSnap = await getDoc(doc(db, USERS, ownerUid));
  if (ownerSnap.exists()) {
    const d = ownerSnap.data() as UserProfile;
    collabs.push({ uid: d.uid, email: d.email, username: d.username, role: 'owner' });
  }

  for (const uid of collaboratorUids) {
    if (uid === ownerUid) continue;
    const snap = await getDoc(doc(db, USERS, uid));
    if (snap.exists()) {
      const d = snap.data() as UserProfile;
      collabs.push({ uid: d.uid, email: d.email, username: d.username, role: 'editor' });
    }
  }

  return collabs;
}
