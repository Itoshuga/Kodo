import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
}

export async function registerUser(
  email: string,
  password: string,
  username: string
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });

  const profile: UserProfile = {
    uid: cred.user.uid,
    email,
    username,
  };

  await setDoc(doc(db, 'users', cred.user.uid), profile);
  localStorage.setItem('kodo_user', JSON.stringify(profile));
  return profile;
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  let profile: UserProfile;
  const snap = await getDoc(doc(db, 'users', cred.user.uid));

  if (snap.exists()) {
    profile = snap.data() as UserProfile;
  } else {
    profile = {
      uid: cred.user.uid,
      email: cred.user.email ?? email,
      username: cred.user.displayName ?? email.split('@')[0],
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
  }

  localStorage.setItem('kodo_user', JSON.stringify(profile));
  return profile;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  localStorage.removeItem('kodo_user');
  localStorage.removeItem('kodo_trips');
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
