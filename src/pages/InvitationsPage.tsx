import { useState, useEffect, useCallback } from 'react';
import { Mail, Check, X, Loader2, Send } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useTripsStore } from '../store/tripsStore';
import {
  fetchInvitesForUser,
  acceptInvite,
  declineInvite,
} from '../services/collaborationService';
import type { TripInvite } from '../types/collaboration';

export function InvitationsPage() {
  const { user } = useAuth();
  const loadTrips = useTripsStore((s) => s.loadTrips);
  const [invites, setInvites] = useState<TripInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchInvitesForUser(user.email);
      setInvites(data);
    } catch {
      setInvites([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAccept(invite: TripInvite) {
    if (!user) return;
    setProcessing(invite.id);
    try {
      await acceptInvite(invite, user.uid);
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      await loadTrips();
    } catch { /* ignore */ }
    setProcessing(null);
  }

  async function handleDecline(invite: TripInvite) {
    setProcessing(invite.id);
    try {
      await declineInvite(invite.id);
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch { /* ignore */ }
    setProcessing(null);
  }

  return (
    <PageLayout>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">
            Invitations
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Trajets partages avec vous par d'autres voyageurs
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
          </div>
        ) : invites.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-10 w-10" />}
            title="Aucune invitation"
            description="Quand quelqu'un vous invitera a collaborer sur un trajet, l'invitation apparaitra ici."
          />
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => {
              const isProcessing = processing === invite.id;
              return (
                <div
                  key={invite.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60"
                >
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-50">
                            <Send className="h-4 w-4 text-teal-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[15px] font-semibold text-stone-800">
                              {invite.tripTitle}
                            </h3>
                            <p className="text-xs text-stone-500">
                              Invite par{' '}
                              <span className="font-semibold text-stone-600">
                                {invite.fromUsername}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDecline(invite)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-stone-200 text-stone-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAccept(invite)}
                          className="flex h-9 items-center gap-1.5 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-40"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Accepter
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-100 bg-stone-50/50 px-5 py-2.5">
                    <p className="text-[11px] text-stone-400">
                      Recu le{' '}
                      {new Date(invite.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
