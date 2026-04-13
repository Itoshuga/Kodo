import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Plus, Mail, UserRound } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/trips', icon: Map, label: 'Trajets' },
  { to: '/trips/new', icon: Plus, label: 'Nouveau' },
  { to: '/invitations', icon: Mail, label: 'Invitations' },
  { to: '/profile', icon: UserRound, label: 'Profil' },
] as const;

export function MobileNav() {
  const location = useLocation();

  function isNavItemActive(to: string, fallbackIsActive: boolean) {
    if (to === '/trips') {
      return location.pathname.startsWith('/trips') && !location.pathname.startsWith('/trips/new');
    }
    if (to === '/profile') {
      return location.pathname.startsWith('/profile') || location.pathname.startsWith('/settings');
    }

    return fallbackIsActive;
  }

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-stone-50 lg:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: '#fafaf9',
      }}
    >
      <ul className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => {
                const isItemActive = isNavItemActive(to, isActive);

                return `flex h-14 flex-col items-center justify-center text-[11px] font-medium transition-colors duration-150 ${
                  isItemActive
                    ? 'text-teal-700'
                    : 'text-stone-400 active:text-stone-600'
                }`;
              }}
            >
              {({ isActive }) => {
                const isItemActive = isNavItemActive(to, isActive);

                return (
                  <>
                    <Icon
                      className="h-[22px] w-[22px]"
                      strokeWidth={isItemActive ? 2.2 : 1.8}
                    />
                    <span className="mt-1 leading-none">{label}</span>
                  </>
                );
              }}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
