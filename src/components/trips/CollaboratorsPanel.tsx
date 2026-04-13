import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  X,
  Crown,
  Pencil,
  Trash2,
  Mail,
  Clock,
  Check,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../ui/ConfirmModal';
import {
  sendInvite,
  fetchInvitesForTrip,
  fetchCollaborators,
  removeCollaborator,
  revokeInvite,
} from '../../services/collaborationService';
import type { TripInvite, TripCollaborator } from '../../types/collaboration';
import type { Trip } from '../../types/trip';

interface CollaboratorsPanelProps {
  trip: Trip;
  onTripUpdated: () => void;
}

export function CollaboratorsPanel({ trip, onTripUpdated }: CollaboratorsPanelProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<TripCollaborator[]>([]);
  const [invites, setInvites] = useState<TripInvite[]>([]);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<TripCollaborator | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<TripInvite | null>(null);

  const tripAny = trip as Trip & { uid?: string };
  const effectiveOwner = trip.ownerUid || tripAny.uid || '';
  const isOwner = user?.uid === effectiveOwner;

  const loadData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const ownerUid = effectiveOwner;
      const [collabs, invs] = await Promise.all([
        fetchCollaborators(ownerUid, trip.collaboratorUids || []),
        isOwner ? fetchInvitesForTrip(trip.id) : Promise.resolve([]),
      ]);
      setCollaborators(collabs);
      setInvites(invs.filter((i) => i.status === 'pending'));
    } catch {
      setCollaborators([]);
      setInvites([]);
    }
    setLoading(false);
  }, [open, trip, isOwner]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSend() {
    if (!user || !email.trim()) return;
    setError('');
    setSuccess('');

    const trimmed = email.trim().toLowerCase();

    if (trimmed === user.email.toLowerCase()) {
      setError('Vous ne pouvez pas vous inviter vous-même.');
      return;
    }

    const alreadyCollab = collaborators.some(
      (c) => c.email.toLowerCase() === trimmed
    );
    if (alreadyCollab) {
      setError('Cette personne fait déjà partie du trajet.');
      return;
    }

    const alreadyInvited = invites.some(
      (i) => i.toEmail === trimmed
    );
    if (alreadyInvited) {
      setError('Une invitation est déjà en attente pour cette adresse.');
      return;
    }

    setSending(true);
    try {
      await sendInvite(trip.id, trip.title, user, trimmed);
      setEmail('');
      setSuccess('Invitation envoyée !');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'envoi.";
      setError(message);
      console.error('[collaboration] sendInvite error:', err);
    }
    setSending(false);
  }

  async function handleRemoveCollab(collab: TripCollaborator) {
    await removeCollaborator(trip.id, collab.uid);
    setConfirmRemove(null);
    onTripUpdated();
    await loadData();
  }

  async function handleRevokeInvite(invite: TripInvite) {
    await revokeInvite(invite.id);
    setConfirmRevoke(null);
    await loadData();
  }

  const collabCount = (trip.collaboratorUids?.length || 0) + 1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200/80 transition-colors hover:bg-stone-50"
      >
        <Users className="h-3.5 w-3.5 text-stone-400" />
        {collabCount} membre{collabCount > 1 ? 's' : ''}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:max-h-[80vh] sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                  <Users className="h-5 w-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-800">Collaborateurs</h3>
                  <p className="text-xs text-stone-500">{trip.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
                </div>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((c) => (
                    <div
                      key={c.uid}
                      className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                          {c.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-800">
                              {c.username}
                            </span>
                            {c.role === 'owner' ? (
                              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                <Crown className="h-2.5 w-2.5" />
                                Proprietaire
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-600">
                                <Pencil className="h-2.5 w-2.5" />
                                Editeur
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-400">{c.email}</span>
                        </div>
                      </div>
                      {isOwner && c.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => setConfirmRemove(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isOwner && invites.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Invitations en attente
                  </p>
                  <div className="space-y-2">
                    {invites.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-xl bg-amber-50/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                            <Clock className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-stone-700">
                              {inv.toEmail}
                            </span>
                            <p className="text-[11px] text-stone-400">
                              En attente d'acceptation
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConfirmRevoke(inv)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="border-t border-stone-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                        setSuccess('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                      }}
                      placeholder="email@exemple.com"
                      className="w-full rounded-xl border-2 border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 transition-colors placeholder:text-stone-400 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!email.trim() || sending}
                    className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
                )}
                {success && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="h-3 w-3" />
                    {success}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmRemove}
        title="Retirer ce collaborateur ?"
        description={`${confirmRemove?.username} n'aura plus accès a ce trajet.`}
        confirmLabel="Retirer"
        variant="danger"
        onConfirm={() => confirmRemove && handleRemoveCollab(confirmRemove)}
        onCancel={() => setConfirmRemove(null)}
      />

      <ConfirmModal
        open={!!confirmRevoke}
        title="Annuler cette invitation ?"
        description={`L'invitation envoyée a ${confirmRevoke?.toEmail} sera supprimée.`}
        confirmLabel="Annuler l'invitation"
        variant="danger"
        onConfirm={() => confirmRevoke && handleRevokeInvite(confirmRevoke)}
        onCancel={() => setConfirmRevoke(null)}
      />
    </>
  );
}

