export type TransportType =
  | 'walk'
  | 'metro'
  | 'train'
  | 'bus'
  | 'taxi'
  | 'shinkansen'
  | 'other';

export interface TripStep {
  id: string;
  order: number;
  type: TransportType;
  title: string;
  from: string;
  to: string;
  departureTime?: string;
  arrivalTime?: string;
  estimatedDuration?: number;
  note?: string;
  lineName?: string;
  platform?: string;
}

export interface Trip {
  id: string;
  title: string;
  description?: string;
  date?: string;
  coverImage?: string;
  steps: TripStep[];
  createdAt: string;
  updatedAt: string;
  ownerUid?: string;
  collaboratorUids?: string[];
}
