import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, Map, Plus, WifiOff, Mail } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useAuth } from '../../contexts/AuthContext';
import { useInvitesStore } from '../../store/invitesStore';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/trips', icon: Map, label: 'Trajets' },
  { to: '/trips/new', icon: Plus, label: 'Nouveau trajet' },
  { to: '/invitations', icon: Mail, label: 'Invitations' },
];

export function DesktopSidebar() {
  const online = useOnlineStatus();
  const { user } = useAuth();
  const pendingInviteCount = useInvitesStore((s) => s.pendingInvites.length);
  const location = useLocation();
  const isProfileActive =
    location.pathname.startsWith('/profile') || location.pathname.startsWith('/settings');
  const displayName = user?.username?.trim() || 'Utilisateur';
  const avatar = displayName.charAt(0).toUpperCase();

  function isNavItemActive(to: string, fallbackIsActive: boolean) {
    if (to === '/trips') {
      return location.pathname.startsWith('/trips') && !location.pathname.startsWith('/trips/new');
    }

    return fallbackIsActive;
  }

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-stone-200/80 bg-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-7 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
          <span className="font-brand text-lg font-bold text-white">K</span>
        </div>
        <span className="font-brand text-2xl font-bold tracking-tight text-stone-800">
          Kodo
        </span>
      </div>

      <div className="mx-5 mb-4 h-px bg-stone-100" />

      <nav aria-label="Navigation principale" className="flex-1 px-4">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => {
                  const isItemActive = isNavItemActive(to, isActive);

                  return `group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 ${
                    isItemActive
                      ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-100/50'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                  }`;
                }}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="inline-flex items-center gap-2">
                  {label}
                  {to === '/invitations' && pendingInviteCount > 0 && (
                    <>
                      <span
                        className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"
                        aria-hidden="true"
                      />
                      <span className="sr-only">
                        {pendingInviteCount} invitation{pendingInviteCount > 1 ? 's' : ''} en attente
                      </span>
                    </>
                  )}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-stone-100 px-5 py-4">
        {user && (
          <Link
            to="/profile"
            className={`mb-3 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
              isProfileActive
                ? 'bg-teal-50 text-teal-700'
                : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              isProfileActive ? 'bg-teal-100 text-teal-700' : 'bg-teal-50 text-teal-700'
            }`}>
              {avatar}
            </div>
            <span className="truncate text-sm font-medium">{displayName}</span>
          </Link>
        )}
        <div className="flex items-center">
          {!online ? (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Mode hors-ligne</span>
            </div>
          ) : (
            <p className="text-xs text-stone-400">
              Disponible hors-ligne
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
