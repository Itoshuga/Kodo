import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-lg shadow-amber-500/20 lg:hidden"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>Mode hors-ligne</span>
    </div>
  );
}
