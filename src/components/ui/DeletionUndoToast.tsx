import { useEffect } from 'react';
import { RotateCcw, Trash2, X } from 'lucide-react';
import { useTripsStore } from '../../store/tripsStore';

const AUTO_CLOSE_MS = 10000;

export function DeletionUndoToast() {
  const pendingUndo = useTripsStore((s) => s.pendingUndo);
  const undoInProgress = useTripsStore((s) => s.undoInProgress);
  const undoLastDeletion = useTripsStore((s) => s.undoLastDeletion);
  const dismissUndo = useTripsStore((s) => s.dismissUndo);

  useEffect(() => {
    if (!pendingUndo) return undefined;

    const remaining = Math.max(0, pendingUndo.expiresAt - Date.now());
    const timeout = window.setTimeout(() => dismissUndo(), remaining || AUTO_CLOSE_MS);
    return () => window.clearTimeout(timeout);
  }, [pendingUndo, dismissUndo]);

  if (!pendingUndo) return null;

  const title = pendingUndo.kind === 'trip' ? 'Trajet supprimé' : 'Étape supprimée';

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[78] flex justify-center lg:inset-x-auto lg:bottom-6 lg:right-6">
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-amber-200/80 bg-white/95 shadow-lg shadow-stone-900/5 backdrop-blur-sm">
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Trash2 className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-800">{title}</p>
            <p className="mt-0.5 text-xs text-stone-500">{pendingUndo.message}</p>
          </div>

          {!undoInProgress && (
            <button
              type="button"
              onClick={dismissUndo}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="border-t border-stone-200/70 bg-stone-50/70 px-4 py-2.5">
          <button
            type="button"
            onClick={() => {
              void undoLastDeletion();
            }}
            disabled={undoInProgress}
            className="inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-teal-700 transition-colors hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {undoInProgress ? 'Annulation...' : 'Annuler'}
          </button>
        </div>
      </div>
    </div>
  );
}
