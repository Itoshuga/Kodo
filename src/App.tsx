import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/Router';
import { MobileNav } from './components/layout/MobileNav';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { useTripsStore } from './store/tripsStore';
import { Loader2 } from 'lucide-react';

function AuthenticatedApp() {
  const { user } = useAuth();
  const setUid = useTripsStore((s) => s.setUid);
  const loadTrips = useTripsStore((s) => s.loadTrips);
  const clear = useTripsStore((s) => s.clear);

  useEffect(() => {
    if (user) {
      setUid(user.uid);
      loadTrips();
    } else {
      clear();
    }
  }, [user, setUid, loadTrips, clear]);

  return (
    <BrowserRouter>
      <OfflineIndicator />
      <DesktopSidebar />
      <AppRouter />
      <MobileNav />
    </BrowserRouter>
  );
}

function AppShell() {
  const { user, loading } = useAuth();

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
