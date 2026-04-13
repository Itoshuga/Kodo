import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onCancel();
  }

  const isDanger = variant === 'danger';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm animate-slide-up rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl sm:rounded-3xl sm:pb-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
              isDanger ? 'bg-red-50' : 'bg-stone-100'
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${isDanger ? 'text-red-500' : 'text-stone-500'}`}
            />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-stone-800">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 border-stone-200 px-4 py-3 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                : 'bg-teal-700 hover:bg-teal-800 active:bg-teal-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
