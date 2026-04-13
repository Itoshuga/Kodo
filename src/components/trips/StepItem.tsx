import { useNavigate } from 'react-router-dom';
import type { TripStep } from '../../types/trip';
import { TransportIcon } from './TransportIcon';
import { getTransportMeta, formatDuration } from '../../utils/transport';
import { Clock, ArrowRight, Info, ChevronRight } from 'lucide-react';

interface StepItemProps {
  step: TripStep;
  tripId: string;
  isFirst: boolean;
  isLast: boolean;
}

export function StepItem({ step, tripId, isFirst, isLast }: StepItemProps) {
  const meta = getTransportMeta(step.type);
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/trips/${tripId}/steps/${step.id}/edit`);
  }

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-0.5 ${isFirst ? 'bg-transparent' : 'bg-stone-200'}`}
          style={{ height: 12 }}
        />
        <div
          className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
          style={{
            backgroundColor: `${meta.color}14`,
            boxShadow: `0 0 0 2px ${meta.color}30`,
          }}
        >
          <TransportIcon type={step.type} size={19} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-stone-200" style={{ minHeight: 20 }} />
        )}
      </div>

      <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-6'} pt-1`}>
        <button
          type="button"
          onClick={handleClick}
          className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-stone-200/60 transition-all duration-150 hover:shadow-md hover:ring-stone-300/80 active:scale-[0.98]"
        >
          <div className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${meta.color}14`,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                  {step.lineName && (
                    <span
                      className="truncate text-xs font-semibold"
                      style={{ color: meta.color }}
                    >
                      {step.lineName}
                    </span>
                  )}
                </div>
                <h4 className="mt-2 text-[15px] font-semibold leading-snug text-stone-800">
                  {step.title}
                </h4>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {step.estimatedDuration && (
                  <span className="flex items-center gap-1 rounded-lg bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-500">
                    <Clock className="h-3 w-3" />
                    {formatDuration(step.estimatedDuration)}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-stone-300" />
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2 text-[13px] text-stone-600">
              <span className="truncate font-medium">{step.from}</span>
              <ArrowRight className="h-3 w-3 flex-shrink-0 text-stone-300" />
              <span className="truncate font-medium">{step.to}</span>
            </div>

            {(step.departureTime || step.arrivalTime || step.platform) && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {step.departureTime && (
                  <span className="rounded-md bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600">
                    Dep. {step.departureTime}
                  </span>
                )}
                {step.arrivalTime && (
                  <span className="rounded-md bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600">
                    Arr. {step.arrivalTime}
                  </span>
                )}
                {step.platform && (
                  <span className="rounded-md bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600">
                    {step.platform}
                  </span>
                )}
              </div>
            )}
          </div>

          {step.note && (
            <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-2.5">
              <div className="flex items-start gap-2 text-xs leading-relaxed text-stone-500">
                <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-stone-400" />
                <span>{step.note}</span>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
