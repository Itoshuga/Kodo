import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Save,
  Shield,
  Sparkles,
  Trash2,
  UserX,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  changeCurrentUserPassword,
  deactivateCurrentUserAccount,
  deleteCurrentUserAccount,
  sendPasswordResetForCurrentUser,
} from '../services/authService';
import {
  ACCENT_OPTIONS,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_PROFILE_PREFERENCES,
  PRIVACY_VISIBILITY_LABELS,
  STYLE_LABELS,
  applyAppTheme,
  hydratePrivacySettings,
  hydrateProfilePreferences,
  loadPrivacySettings,
  loadProfilePreferences,
  savePrivacySettings,
  savePrivacySettingsToFirestore,
  saveProfilePreferences,
  saveProfilePreferencesToFirestore,
  type AccentKey,
  type PrivacySettings,
  type PrivacyVisibility,
  type ProfilePreferences,
  type TravelStyle,
} from '../utils/profilePreferences';

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-xl border border-stone-200/80 bg-stone-50/70 px-3 py-2.5">
      <div>
        <p className="text-sm font-semibold text-stone-700">{title}</p>
        <p className="mt-0.5 text-xs text-stone-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative mt-0.5 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-teal-700' : 'bg-stone-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

export function SettingsPage() {
  const { user } = useAuth();

  const [prefs, setPrefs] = useState<ProfilePreferences>(DEFAULT_PROFILE_PREFERENCES);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);

  const [profileSaved, setProfileSaved] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [privacyError, setPrivacyError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  const [showDeactivateForm, setShowDeactivateForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [accountError, setAccountError] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const localPrefs = loadProfilePreferences(user?.uid);
    const localPrivacy = loadPrivacySettings(user?.uid);

    setPrefs(localPrefs);
    setPrivacy(localPrivacy);

    setProfileSaved(false);
    setPrivacySaved(false);
    setProfileError('');
    setPrivacyError('');
    setSecurityError('');
    setSecurityMessage('');
    setAccountError('');

    let cancelled = false;

    (async () => {
      if (!user?.uid) return;

      const [syncedPrefs, syncedPrivacy] = await Promise.all([
        hydrateProfilePreferences(user.uid),
        hydratePrivacySettings(user.uid),
      ]);

      if (cancelled) return;

      setPrefs(syncedPrefs);
      setPrivacy(syncedPrivacy);
      applyAppTheme(syncedPrefs.accent);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const accent = useMemo(() => {
    return ACCENT_OPTIONS.find((item) => item.key === prefs.accent) ?? ACCENT_OPTIONS[0];
  }, [prefs.accent]);

  const displayName = user?.username?.trim() || 'Utilisateur';
  const avatar = displayName.charAt(0).toUpperCase();

  function updatePref<K extends keyof ProfilePreferences>(key: K, value: ProfilePreferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));

    if (key === 'accent') {
      applyAppTheme(value as AccentKey);
    }

    setProfileSaved(false);
    setProfileError('');
  }

  function updatePrivacy<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
    setPrivacySaved(false);
    setPrivacyError('');
  }

  async function handleSaveProfile() {
    setProfileError('');
    saveProfilePreferences(user?.uid, prefs);
    applyAppTheme(prefs.accent);

    try {
      await saveProfilePreferencesToFirestore(user?.uid, prefs);
      setProfileSaved(true);
    } catch {
      setProfileSaved(true);
      setProfileError('Profil sauvegardé en local, synchronisation cloud indisponible.');
    }
  }

  async function handleSavePrivacy() {
    setPrivacyError('');
    savePrivacySettings(user?.uid, privacy);

    try {
      await savePrivacySettingsToFirestore(user?.uid, privacy);
      setPrivacySaved(true);
    } catch {
      setPrivacySaved(true);
      setPrivacyError('Confidentialité sauvegardée en local, synchronisation cloud indisponible.');
    }
  }

  function handleResetProfile() {
    setPrefs(DEFAULT_PROFILE_PREFERENCES);
    applyAppTheme(DEFAULT_PROFILE_PREFERENCES.accent);
    setProfileSaved(false);
    setProfileError('');
  }

  function handleResetPrivacy() {
    setPrivacy(DEFAULT_PRIVACY_SETTINGS);
    setPrivacySaved(false);
    setPrivacyError('');
  }

  async function handleChangePassword() {
    setSecurityError('');
    setSecurityMessage('');

    if (newPassword.trim().length < 6) {
      setSecurityError('Le nouveau mot de passe doit faire au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeCurrentUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityMessage('Mot de passe mis à jour avec succès.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        setSecurityError('Mot de passe actuel incorrect.');
      } else if (message.includes('auth/weak-password')) {
        setSecurityError('Le nouveau mot de passe est trop faible.');
      } else {
        setSecurityError('Impossible de modifier le mot de passe pour le moment.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSendResetEmail() {
    setSecurityError('');
    setSecurityMessage('');
    setIsSendingResetEmail(true);

    try {
      await sendPasswordResetForCurrentUser(user?.email);
      setSecurityMessage('Email de réinitialisation envoyé. Vérifiez votre boîte mail.');
    } catch {
      setSecurityError('Impossible d’envoyer l’email de réinitialisation.');
    } finally {
      setIsSendingResetEmail(false);
    }
  }

  async function handleDeactivateAccount() {
    setAccountError('');

    if (!deactivatePassword.trim()) {
      setAccountError('Renseignez votre mot de passe pour confirmer la désactivation.');
      return;
    }

    setIsDeactivating(true);

    try {
      await deactivateCurrentUserAccount(deactivatePassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        setAccountError('Mot de passe incorrect.');
      } else {
        setAccountError('Impossible de désactiver le compte pour le moment.');
      }
    } finally {
      setIsDeactivating(false);
    }
  }

  async function handleDeleteAccount() {
    setAccountError('');

    if (deleteConfirmation.trim().toUpperCase() !== 'SUPPRIMER') {
      setAccountError('Tapez SUPPRIMER pour confirmer la suppression définitive.');
      return;
    }

    if (!deletePassword.trim()) {
      setAccountError('Renseignez votre mot de passe pour confirmer la suppression.');
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCurrentUserAccount(deletePassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        setAccountError('Mot de passe incorrect.');
      } else {
        setAccountError('Impossible de supprimer le compte pour le moment.');
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="page-container-centered">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-800">Paramètres</h1>
              <p className="mt-1 text-sm text-stone-500">
                Gérez votre profil, votre confidentialité, votre sécurité et votre compte.
              </p>
            </div>
            <Link
              to="/profile"
              className="btn-ghost rounded-xl border border-stone-200 bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>

          <section
            className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${accent.coverClass} p-6 text-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.55)] lg:p-8`}
          >
            <div className="pointer-events-none absolute -right-16 -top-14 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex flex-col gap-5">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                <div
                  className={`flex h-16 w-16 shrink-0 aspect-square items-center justify-center rounded-2xl bg-white/90 p-0 text-2xl font-bold leading-none text-stone-700 ring-4 ${accent.ringClass}`}
                >
                  {avatar}
                </div>
                <div>
                  <h2 className="text-xl font-semibold leading-tight text-white sm:text-2xl">{displayName}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">{prefs.bio}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 font-semibold text-white backdrop-blur-sm">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Vérifié
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${accent.chipClass}`}>
                  <MapPin className="h-3.5 w-3.5" />
                  {prefs.city}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 font-semibold text-white backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {STYLE_LABELS[prefs.style]}
                </span>
              </div>
            </div>
          </section>

          <div className="mt-5 space-y-4">
            <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-stone-500" />
                  <h3 className="text-base font-semibold text-stone-800">Personnalisation</h3>
                </div>
                {profileSaved && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    Sauvegardé
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Ville phare</label>
                    <input
                      type="text"
                      value={prefs.city}
                      onChange={(e) => updatePref('city', e.target.value)}
                      className="input-field"
                      placeholder="Votre ville"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Style</label>
                    <select
                      value={prefs.style}
                      onChange={(e) => updatePref('style', e.target.value as TravelStyle)}
                      className="input-field"
                    >
                      <option value="slow">Slow travel</option>
                      <option value="food">Food spots</option>
                      <option value="culture">Culture first</option>
                      <option value="photo">Photo walk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Bio</label>
                  <textarea
                    rows={4}
                    value={prefs.bio}
                    onChange={(e) => updatePref('bio', e.target.value)}
                    className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 transition-colors focus:border-teal-600 focus:outline-none"
                    placeholder="Parlez de votre façon de voyager..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">Ambiance visuelle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCENT_OPTIONS.map((option) => {
                      const selected = prefs.accent === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => updatePref('accent', option.key)}
                          className={`rounded-xl border px-3 py-2 text-left transition-all ${
                            selected
                              ? 'border-stone-800 bg-stone-50'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <span className={`mb-1 block h-4 w-full rounded-full bg-gradient-to-r ${option.coverClass}`} />
                          <span className="text-xs font-semibold text-stone-700">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      void handleSaveProfile();
                    }}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer le profil
                  </button>
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    className="btn-ghost rounded-xl border border-stone-200 bg-white"
                  >
                    Réinitialiser
                  </button>
                </div>

                {profileError && <p className="text-sm font-medium text-amber-700">{profileError}</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-stone-500" />
                  <h3 className="text-base font-semibold text-stone-800">Confidentialité</h3>
                </div>
                {privacySaved && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    Sauvegardé
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Visibilité du profil</label>
                  <select
                    value={privacy.visibility}
                    onChange={(e) => updatePrivacy('visibility', e.target.value as PrivacyVisibility)}
                    className="input-field"
                  >
                    {Object.entries(PRIVACY_VISIBILITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <ToggleRow
                  title="Invitations par email"
                  description="Autoriser d'autres utilisateurs à vous inviter via votre email."
                  checked={privacy.allowInvitesByEmail}
                  onToggle={() => updatePrivacy('allowInvitesByEmail', !privacy.allowInvitesByEmail)}
                />

                <ToggleRow
                  title="Afficher mon email aux collaborateurs"
                  description="Rendre votre email visible dans les espaces de collaboration."
                  checked={privacy.showEmailToCollaborators}
                  onToggle={() => updatePrivacy('showEmailToCollaborators', !privacy.showEmailToCollaborators)}
                />

                <ToggleRow
                  title="Statut d’activité"
                  description="Partager votre activité récente dans les espaces partagés."
                  checked={privacy.showActivityStatus}
                  onToggle={() => updatePrivacy('showActivityStatus', !privacy.showActivityStatus)}
                />

                <ToggleRow
                  title="Trouvable par email"
                  description="Permettre aux utilisateurs de retrouver votre profil via email."
                  checked={privacy.searchableByEmail}
                  onToggle={() => updatePrivacy('searchableByEmail', !privacy.searchableByEmail)}
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      void handleSavePrivacy();
                    }}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer la confidentialité
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPrivacy}
                    className="btn-ghost rounded-xl border border-stone-200 bg-white"
                  >
                    Réinitialiser
                  </button>
                </div>

                {privacyError && <p className="text-sm font-medium text-amber-700">{privacyError}</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-stone-500" />
                <h3 className="text-base font-semibold text-stone-800">Sécurité</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Confirmation</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleChangePassword();
                    }}
                    disabled={isChangingPassword}
                    className="btn-primary"
                  >
                    <KeyRound className="h-4 w-4" />
                    {isChangingPassword ? 'Mise à jour...' : 'Changer le mot de passe'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handleSendResetEmail();
                    }}
                    disabled={isSendingResetEmail}
                    className="btn-ghost rounded-xl border border-stone-200 bg-white"
                  >
                    <Mail className="h-4 w-4" />
                    {isSendingResetEmail ? 'Envoi...' : 'Envoyer un lien de réinitialisation'}
                  </button>
                </div>

                {securityMessage && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {securityMessage}
                  </p>
                )}
                {securityError && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                    {securityError}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-rose-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <h3 className="text-base font-semibold text-stone-800">Zone compte</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Désactiver temporairement mon compte</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        Votre compte sera bloqué à la connexion, mais restera récupérable.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeactivateForm((prev) => !prev)}
                      className="btn-ghost rounded-xl border border-stone-200 bg-white"
                    >
                      <UserX className="h-4 w-4" />
                      {showDeactivateForm ? 'Fermer' : 'Désactiver'}
                    </button>
                  </div>

                  {showDeactivateForm && (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <div className="min-w-[220px] flex-1">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Mot de passe</label>
                        <input
                          type="password"
                          value={deactivatePassword}
                          onChange={(e) => setDeactivatePassword(e.target.value)}
                          className="input-field"
                          placeholder="Confirmer votre mot de passe"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void handleDeactivateAccount();
                        }}
                        disabled={isDeactivating}
                        className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isDeactivating ? 'Désactivation...' : 'Confirmer la désactivation'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-rose-700">Supprimer définitivement mon compte</p>
                      <p className="mt-0.5 text-xs text-rose-600/90">
                        Action irréversible. Les accès seront supprimés définitivement.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteForm((prev) => !prev)}
                      className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                    >
                      <Trash2 className="mr-1 inline h-4 w-4" />
                      {showDeleteForm ? 'Fermer' : 'Supprimer'}
                    </button>
                  </div>

                  {showDeleteForm && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-rose-700">Tapez SUPPRIMER pour confirmer.</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          className="input-field"
                          placeholder="SUPPRIMER"
                        />
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="input-field"
                          placeholder="Mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            void handleDeleteAccount();
                          }}
                          disabled={isDeleting}
                          className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {accountError && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                    {accountError}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
