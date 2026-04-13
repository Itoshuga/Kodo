import { create } from 'zustand';
import type { TripInvite } from '../types/collaboration';

interface InviteToastPayload {
  id: string;
  inviteId: string;
  tripTitle: string;
  fromUsername: string;
}

interface InvitesState {
  pendingInvites: TripInvite[];
  activeToast: InviteToastPayload | null;
  toastQueue: InviteToastPayload[];
  setPendingInvites: (invites: TripInvite[]) => void;
  enqueueInviteToast: (invite: TripInvite) => void;
  dismissToast: () => void;
  clear: () => void;
}

function toToastPayload(invite: TripInvite): InviteToastPayload {
  return {
    id: `${invite.id}-${Date.now()}`,
    inviteId: invite.id,
    tripTitle: invite.tripTitle,
    fromUsername: invite.fromUsername,
  };
}

export const useInvitesStore = create<InvitesState>((set) => ({
  pendingInvites: [],
  activeToast: null,
  toastQueue: [],

  setPendingInvites(invites: TripInvite[]) {
    set({ pendingInvites: invites });
  },

  enqueueInviteToast(invite: TripInvite) {
    const payload = toToastPayload(invite);
    set((state) => {
      if (!state.activeToast) {
        return { activeToast: payload };
      }
      return { toastQueue: [...state.toastQueue, payload] };
    });
  },

  dismissToast() {
    set((state) => {
      if (state.toastQueue.length === 0) {
        return { activeToast: null };
      }
      const [next, ...rest] = state.toastQueue;
      return {
        activeToast: next,
        toastQueue: rest,
      };
    });
  },

  clear() {
    set({
      pendingInvites: [],
      activeToast: null,
      toastQueue: [],
    });
  },
}));

