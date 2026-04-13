import type { TransportType } from '../types/trip';

interface TransportMeta {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

const transportMap: Record<TransportType, TransportMeta> = {
  walk: {
    label: 'Marche',
    color: '#16a34a',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  metro: {
    label: 'Metro',
    color: '#2563eb',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  train: {
    label: 'Train',
    color: '#ea580c',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  bus: {
    label: 'Bus',
    color: '#0891b2',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
  },
  taxi: {
    label: 'Taxi',
    color: '#ca8a04',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
  },
  shinkansen: {
    label: 'Shinkansen',
    color: '#dc2626',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  other: {
    label: 'Autre',
    color: '#64748b',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
  },
};

export function getTransportMeta(type: TransportType): TransportMeta {
  return transportMap[type];
}

export function getAllTransportTypes(): TransportType[] {
  return Object.keys(transportMap) as TransportType[];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}
