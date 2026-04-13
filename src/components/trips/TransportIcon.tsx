import {
  Footprints,
  TrainFront,
  Bus,
  Car,
  Zap,
  CircleDot,
  HelpCircle,
  Clock3,
  Route,
  MapPin,
} from 'lucide-react';
import type { TransportType } from '../../types/trip';
import { getTransportMeta } from '../../utils/transport';

const iconMap: Record<TransportType, React.ElementType> = {
  walk: Footprints,
  metro: CircleDot,
  train: TrainFront,
  bus: Bus,
  taxi: Car,
  shinkansen: Zap,
  wait: Clock3,
  transfer: Route,
  visit: MapPin,
  other: HelpCircle,
};

interface TransportIconProps {
  type: TransportType;
  size?: number;
}

export function TransportIcon({ type, size = 18 }: TransportIconProps) {
  const Icon = iconMap[type];
  const meta = getTransportMeta(type);

  return <Icon style={{ color: meta.color }} width={size} height={size} />;
}
