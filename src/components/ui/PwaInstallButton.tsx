import { useState } from 'react';
import { Download, Share, Plus, X, MoreVertical } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

interface PwaInstallButtonProps {
  variant?: 'inline' | 'floating-mobile';
}

export function PwaInstallButton({ variant = 'inline' }: PwaInstallButtonProps) {
  const { installState, install } = usePwaInstall();
  const [showIosModal, setShowIosModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  if (installState === 'unavailable') return null;

  async function handleClick() {
    if (installState === 'android') {
      const prompted = await install();
      if (!prompted) {
        setShowAndroidModal(true);
      }
      return;
    }

    setShowIosModal(true);
  }

  const isFloating = variant === 'floating-mobile';

  return (
    <>
      <div className={isFloating ? 'w-full' : 'mt-6'}>
        <button
          type="button"
          onClick={handleClick}
          className={
            isFloating
              ? 'flex w-full items-center justify-center gap-2.5 rounded-2xl border border-teal-200 bg-white/95 px-4 py-3.5 text-sm font-semibold text-teal-700 shadow-lg shadow-teal-100/80 backdrop-blur-sm transition-all hover:bg-white'
              : 'flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 px-4 py-3.5 text-sm font-semibold text-stone-600 transition-all hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700'
          }
        >
          <Download className="h-4 w-4" />
          {isFloating ? 'Installer l\'app (Android / iOS)' : 'Installer l\'application'}
        </button>
      </div>

      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-800">Installer Kodo</h2>
                <p className="mt-1 text-sm text-stone-500">Suivez ces etapes sur Safari</p>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-stone-700">
                    Appuyez sur le bouton <strong>Partager</strong>
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1">
                    <Share className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-stone-500">en bas de Safari</span>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-stone-700">
                    Faites defiler et appuyez sur{' '}
                    <strong>"Sur l'ecran d'accueil"</strong>
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1">
                    <Plus className="h-4 w-4 text-stone-600" />
                    <span className="text-xs text-stone-500">Sur l'ecran d'accueil</span>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-stone-700">
                    Appuyez sur <strong>"Ajouter"</strong> en haut a droite
                  </p>
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIosModal(false)}
              className="mt-6 w-full rounded-2xl bg-teal-700 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {showAndroidModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-800">Installer Kodo</h2>
                <p className="mt-1 text-sm text-stone-500">Sur Android, via Chrome</p>
              </div>
              <button
                onClick={() => setShowAndroidModal(false)}
                className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-stone-700">
                    Ouvrez le menu du navigateur
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1">
                    <MoreVertical className="h-4 w-4 text-stone-600" />
                    <span className="text-xs text-stone-500">menu en haut a droite</span>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-stone-700">
                    Appuyez sur <strong>"Installer l'application"</strong> ou
                    <strong> "Ajouter a l'ecran d'accueil"</strong>
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-stone-700">
                    Confirmez pour installer l'app
                  </p>
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowAndroidModal(false)}
              className="mt-6 w-full rounded-2xl bg-teal-700 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
