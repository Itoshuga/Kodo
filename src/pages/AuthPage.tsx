import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PwaInstallButton } from '../components/ui/PwaInstallButton';

type Mode = 'login' | 'register';

const COVER = 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, username);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue';
      if (msg.includes('auth/email-already-in-use')) {
        setError('Cet email est deja utilise.');
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Email ou mot de passe incorrect.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Le mot de passe doit faire au moins 6 caracteres.');
      } else if (msg.includes('auth/invalid-email')) {
        setError('Adresse email invalide.');
      } else if (msg.includes('auth/user-not-found')) {
        setError('Aucun compte trouve avec cet email.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 lg:block">
        <div className="relative h-full">
          <img
            src={COVER}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-teal-800/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="font-brand text-xl font-bold text-white">K</span>
              </div>
              <span className="font-brand text-3xl font-bold text-white">Kodo</span>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-white/80">
              Planifiez chaque etape de vos trajets au Japon. Metro, Shinkansen, marche a pied -- tout est la, meme hors-ligne.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-12 lg:py-12">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-hero">
                  <span className="font-brand text-lg font-bold text-white">K</span>
                </div>
                <span className="font-brand text-2xl font-bold text-stone-800">Kodo</span>
              </div>
            </div>

            <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800">
              {mode === 'login' ? 'Bon retour' : 'Creer un compte'}
            </h1>
            <p className="mt-2 text-base text-stone-500">
              {mode === 'login'
                ? 'Connectez-vous pour retrouver vos trajets.'
                : 'Rejoignez Kodo pour planifier vos voyages.'}
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {mode === 'register' && (
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre pseudo"
                    className="input-floating"
                    autoComplete="username"
                  />
                  <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Pseudo
                  </label>
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className="input-floating"
                  autoComplete="email"
                />
                <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Email
                </label>
              </div>

              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="input-floating pr-10"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-4 p-2 text-stone-400 transition-colors hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Se connecter' : 'Creer mon compte'}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-sm font-medium text-stone-500 transition-colors hover:text-teal-700"
              >
                {mode === 'login'
                  ? 'Pas encore de compte ? Inscrivez-vous'
                  : 'Deja un compte ? Connectez-vous'}
              </button>
            </div>

            <div className="hidden lg:block">
              <PwaInstallButton />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <div className="mx-auto w-full max-w-sm">
          <PwaInstallButton variant="floating-mobile" />
        </div>
      </div>
    </div>
  );
}
