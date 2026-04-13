import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, X } from 'lucide-react';
import { useInvitesStore } from '../../store/invitesStore';

const AUTO_CLOSE_MS = 5000;

export function InviteToast() {
  const activeToast = useInvitesStore((s) => s.activeToast);
  const dismissToast = useInvitesStore((s) => s.dismissToast);

  useEffect(() => {
    if (!activeToast) return;
    const timeoutId = window.setTimeout(() => dismissToast(), AUTO_CLOSE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[80] flex justify-center lg:inset-x-auto lg:right-6 lg:top-6">
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-teal-200/70 bg-white/95 shadow-lg shadow-stone-900/5 backdrop-blur-sm">
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-800">Nouvelle invitation</p>
            <p className="mt-0.5 text-xs text-stone-500">
              {activeToast.fromUsername} vous invite sur {activeToast.tripTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Fermer la notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-t border-stone-200/70 bg-stone-50/70 px-4 py-2.5">
          <Link
            to="/invitations"
            onClick={dismissToast}
            className="inline-flex items-center rounded-lg text-xs font-semibold text-teal-700 transition-colors hover:text-teal-800"
          >
            Voir les invitations
          </Link>
        </div>
      </div>
    </div>
  );
}

