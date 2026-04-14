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
    label: 'Métro',
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
    label: 'Train express',
    color: '#dc2626',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  wait: {
    label: 'Attente',
    color: '#475569',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
  },
  transfer: {
    label: 'Correspondance',
    color: '#0f766e',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
  },
  visit: {
    label: 'Visite',
    color: '#be123c',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
  },
  other: {
    label: 'Autre',
    color: '#64748b',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
  },
};

interface StepTypeConfig {
  requiresFrom: boolean;
  requiresTo: boolean;
  fromLabel: string;
  toLabel: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  titlePlaceholder: string;
  showLinePlatform: boolean;
}

const stepTypeConfig: Record<TransportType, StepTypeConfig> = {
  walk: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Départ',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Point de départ',
    toPlaceholder: 'Point d’arrivée',
    titlePlaceholder: 'Marche vers...',
    showLinePlatform: false,
  },
  metro: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Départ',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Station de départ',
    toPlaceholder: 'Station d’arrivée',
    titlePlaceholder: 'Métro vers...',
    showLinePlatform: true,
  },
  train: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Départ',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Gare de départ',
    toPlaceholder: 'Gare d’arrivée',
    titlePlaceholder: 'Train vers...',
    showLinePlatform: true,
  },
  bus: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Départ',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Arrêt de départ',
    toPlaceholder: 'Arrêt d’arrivée',
    titlePlaceholder: 'Bus vers...',
    showLinePlatform: true,
  },
  taxi: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Prise en charge',
    toLabel: 'Destination',
    fromPlaceholder: 'Lieu de départ',
    toPlaceholder: 'Lieu d’arrivée',
    titlePlaceholder: 'Taxi vers...',
    showLinePlatform: false,
  },
  shinkansen: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Départ',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Gare de départ',
    toPlaceholder: 'Gare d’arrivée',
    titlePlaceholder: 'Train express vers...',
    showLinePlatform: true,
  },
  wait: {
    requiresFrom: true,
    requiresTo: false,
    fromLabel: 'Lieu',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Ex: Hall de gare',
    toPlaceholder: '',
    titlePlaceholder: 'Temps d’attente',
    showLinePlatform: false,
  },
  transfer: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Depuis',
    toLabel: 'Vers',
    fromPlaceholder: 'Ligne / quai actuel',
    toPlaceholder: 'Ligne / quai suivant',
    titlePlaceholder: 'Correspondance',
    showLinePlatform: true,
  },
  visit: {
    requiresFrom: true,
    requiresTo: false,
    fromLabel: 'Lieu de visite',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Temple, quartier, musée...',
    toPlaceholder: '',
    titlePlaceholder: 'Visite',
    showLinePlatform: false,
  },
  other: {
    requiresFrom: true,
    requiresTo: true,
    fromLabel: 'Départ',
    toLabel: 'Arrivée',
    fromPlaceholder: 'Point de départ',
    toPlaceholder: 'Point d’arrivée',
    titlePlaceholder: 'Étape personnalisée',
    showLinePlatform: true,
  },
};

export function getTransportMeta(type: TransportType): TransportMeta {
  return transportMap[type];
}

export function getAllTransportTypes(): TransportType[] {
  return Object.keys(transportMap) as TransportType[];
}

export function getStepTypeConfig(type: TransportType): StepTypeConfig {
  return stepTypeConfig[type];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}
