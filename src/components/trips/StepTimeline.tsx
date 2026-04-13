import type { TripStep } from '../../types/trip';
import { StepItem } from './StepItem';

interface StepTimelineProps {
  steps: TripStep[];
  tripId: string;
}

export function StepTimeline({ steps, tripId }: StepTimelineProps) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div role="list" aria-label="Étapes du trajet" className="mx-auto max-w-3xl px-0.5">
      {sorted.map((step, i) => (
        <div role="listitem" key={step.id}>
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

