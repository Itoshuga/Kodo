export type TransportType =
  | 'walk'
  | 'metro'
  | 'train'
  | 'bus'
  | 'taxi'
  | 'shinkansen'
  | 'wait'
  | 'transfer'
  | 'visit'
  | 'other';

export interface TripStep {
  id: string;
  order: number;
  type: TransportType;
  title: string;
  from?: string;
  to?: string;
  dayIndex?: number;
  departureTime?: string;
  arrivalTime?: string;
  estimatedDuration?: number;
  note?: string;
  lineName?: string;
  platform?: string;
  link?: string;
}

export interface Trip {
  id: string;
  title: string;
  description?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  steps: TripStep[];
  createdAt: string;
  updatedAt: string;
  ownerUid?: string;
  collaboratorUids?: string[];
}
