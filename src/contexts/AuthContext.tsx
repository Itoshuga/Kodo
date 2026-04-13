import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import {
  getCachedUser,
  loginUser,
  registerUser,
  signOut as authSignOut,
} from '../services/authService';
import type { UserProfile } from '../services/authService';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getCachedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const cached = getCachedUser();
        if (cached && cached.uid === firebaseUser.uid) {
          setUser(cached);
          setLoading(false);
        } else {
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            username: firebaseUser.displayName ?? '',
          };
          setUser(profile);
          setLoading(false);

          (async () => {
            try {
              const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (snap.exists()) {
                const full = snap.data() as UserProfile;
                setUser(full);
                localStorage.setItem('kodo_user', JSON.stringify(full));
              } else {
                localStorage.setItem('kodo_user', JSON.stringify(profile));
              }
            } catch {
              localStorage.setItem('kodo_user', JSON.stringify(profile));
            }
          })();
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await loginUser(email, password);
    setUser(profile);
  }, []);

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      const profile = await registerUser(email, password, username);
      setUser(profile);
    },
    []
  );

  const logout = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
