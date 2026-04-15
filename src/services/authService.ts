import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
}

interface UserDocShape extends UserProfile {
  emailLower?: string;
  accountStatus?: 'active' | 'disabled';
  accountDisabledAt?: string;
}

function clearClientSessionData(): void {
  localStorage.removeItem('kodo_user');
  localStorage.removeItem('kodo_trips');
}

function isAccountDisabled(data: Partial<UserDocShape> | undefined): boolean {
  if (!data) return false;
  return data.accountStatus === 'disabled' || typeof data.accountDisabledAt === 'string';
}

export async function registerUser(
  email: string,
  password: string,
  username: string
): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });

  const profile: UserProfile = {
    uid: cred.user.uid,
    email: normalizedEmail,
    username,
  };

  await setDoc(doc(db, 'users', cred.user.uid), {
    ...profile,
    emailLower: normalizedEmail,
    accountStatus: 'active',
  });
  localStorage.setItem('kodo_user', JSON.stringify(profile));
  return profile;
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const normalizedFallbackEmail = email.trim().toLowerCase();

  let profile: UserProfile;
  const snap = await getDoc(doc(db, 'users', cred.user.uid));

  if (snap.exists()) {
    const data = snap.data() as UserDocShape;

    if (isAccountDisabled(data)) {
      await firebaseSignOut(auth).catch(() => {});
      throw new Error('account/deactivated');
    }

    profile = {
      uid: data.uid,
      email: (data.email || normalizedFallbackEmail).toLowerCase(),
      username: data.username,
    };

    // Ensure legacy user documents are normalized for invite lookups.
    const emailLower = data.emailLower || profile.email.toLowerCase();
    await setDoc(
      doc(db, 'users', cred.user.uid),
      { ...profile, emailLower, accountStatus: 'active' },
      { merge: true }
    );
  } else {
    profile = {
      uid: cred.user.uid,
      email: (cred.user.email ?? email).trim().toLowerCase(),
      username: cred.user.displayName ?? email.split('@')[0],
    };
    await setDoc(doc(db, 'users', cred.user.uid), {
      ...profile,
      emailLower: profile.email.toLowerCase(),
      accountStatus: 'active',
    });
  }

  localStorage.setItem('kodo_user', JSON.stringify(profile));
  return profile;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  clearClientSessionData();
}

async function reauthenticateCurrentUser(password: string) {
  const user = auth.currentUser;
  if (!user?.email) {
    throw new Error('auth/unauthenticated');
  }

  const safePassword = password.trim();
  if (!safePassword) {
    throw new Error('auth/missing-password');
  }

  const credential = EmailAuthProvider.credential(user.email, safePassword);
  await reauthenticateWithCredential(user, credential);

  return user;
}

export async function sendPasswordResetForCurrentUser(email?: string): Promise<void> {
  const targetEmail = (email ?? auth.currentUser?.email ?? '').trim().toLowerCase();
  if (!targetEmail) {
    throw new Error('auth/invalid-email');
  }

  await sendPasswordResetEmail(auth, targetEmail);
}

export async function changeCurrentUserPassword(
  currentPassword: string,
  nextPassword: string
): Promise<void> {
  const user = await reauthenticateCurrentUser(currentPassword);

  const safePassword = nextPassword.trim();
  if (safePassword.length < 6) {
    throw new Error('auth/weak-password');
  }

  await updatePassword(user, safePassword);
}

export async function deactivateCurrentUserAccount(password: string): Promise<void> {
  const user = await reauthenticateCurrentUser(password);

  await setDoc(
    doc(db, 'users', user.uid),
    {
      accountStatus: 'disabled',
      accountDisabledAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await firebaseSignOut(auth);
  clearClientSessionData();
}

export async function deleteCurrentUserAccount(password: string): Promise<void> {
  const user = await reauthenticateCurrentUser(password);
  const userDocRef = doc(db, 'users', user.uid);

  await deleteDoc(userDocRef).catch(() => {
    // Best-effort cleanup.
  });

  await deleteUser(user);
  clearClientSessionData();
}

export function getCachedUser(): UserProfile | null {
  const raw = localStorage.getItem('kodo_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
