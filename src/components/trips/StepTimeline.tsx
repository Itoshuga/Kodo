import type { TripStep } from '../../types/trip';
import { StepItem } from './StepItem';

interface StepTimelineProps {
  steps: TripStep[];
  tripId: string;
}

export function StepTimeline({ steps, tripId }: StepTimelineProps) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div role="list" aria-label="Étapes du trajet" className="w-full min-w-0 overflow-x-hidden">
      {sorted.map((step, i) => (
        <div role="listitem" key={step.id} className="min-w-0">
          <StepItem
            step={step}
            tripId={tripId}
            isFirst={i === 0}
            isLast={i === sorted.length - 1}
          />
        </div>
      ))}
    </div>
  );
}

