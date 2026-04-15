import { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/Router';
import { MobileNav } from './components/layout/MobileNav';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { InviteToast } from './components/ui/InviteToast';
import { TripSyncToast } from './components/ui/TripSyncToast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import {
  subscribePendingInvitesForUser,
  fetchInvitesForUser,
} from './services/collaborationService';
import { useInvitesStore } from './store/invitesStore';
import { useTripsStore } from './store/tripsStore';
import { Loader2 } from 'lucide-react';
import { applyAppTheme, loadProfilePreferences } from './utils/profilePreferences';

function AuthenticatedApp() {
  const { user } = useAuth();
  const setUid = useTripsStore((s) => s.setUid);
  const loadTrips = useTripsStore((s) => s.loadTrips);
  const clear = useTripsStore((s) => s.clear);
  const setPendingInvites = useInvitesStore((s) => s.setPendingInvites);
  const enqueueInviteToast = useInvitesStore((s) => s.enqueueInviteToast);
  const clearInvites = useInvitesStore((s) => s.clear);
  const previousInviteIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (user) {
      setUid(user.uid);
      loadTrips();
    } else {
      clear();
    }
  }, [user, setUid, loadTrips, clear]);

  useEffect(() => {
    if (!user?.email) {
      previousInviteIdsRef.current = null;
      clearInvites();
      return;
    }

    const unsubscribe = subscribePendingInvitesForUser(
      user.email,
      (invites) => {
        setPendingInvites(invites);

        const previousIds = previousInviteIdsRef.current;
        const currentIds = new Set(invites.map((invite) => invite.id));

        if (previousIds) {
          invites.forEach((invite) => {
            if (!previousIds.has(invite.id)) {
              enqueueInviteToast(invite);
            }
          });
        }

        previousInviteIdsRef.current = currentIds;
      },
      async (error) => {
        console.error('[invites] subscribe error:', error);
        try {
          const fallbackInvites = await fetchInvitesForUser(user.email);
          setPendingInvites(fallbackInvites);
        } catch (fallbackError) {
          console.error('[invites] fallback fetch error:', fallbackError);
          setPendingInvites([]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.email, setPendingInvites, enqueueInviteToast, clearInvites]);

  return (
    <BrowserRouter>
      <OfflineIndicator />
      <DesktopSidebar />
      <AppRouter />
      <MobileNav />
      <InviteToast />
      <TripSyncToast />
    </BrowserRouter>
  );
}

function AppShell() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const prefs = loadProfilePreferences(user?.uid);
    applyAppTheme(prefs.accent);
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero">
            <span className="font-brand text-2xl font-bold text-white">K</span>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
