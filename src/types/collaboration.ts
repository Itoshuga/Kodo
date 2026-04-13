export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface TripInvite {
  id: string;
  tripId: string;
  tripTitle: string;
  fromUid: string;
  fromUsername: string;
  toEmail: string;
  toUid?: string | null;
  status: InviteStatus;
  createdAt: string;
}

export interface TripCollaborator {
  uid: string;
  email: string;
  username: string;
  role: 'owner' | 'editor';
}
