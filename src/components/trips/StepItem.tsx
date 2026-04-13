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
  const fromLabel = step.from?.trim();
  const toLabel = step.to?.trim();
  const hasRoute = Boolean(fromLabel && toLabel);

  function handleClick() {
    navigate(`/trips/${tripId}/steps/${step.id}`);
  }

  return (
    <div className="relative flex min-w-0 gap-3 sm:gap-5">
      <div className="flex w-10 flex-shrink-0 flex-col items-center sm:w-11">
        <div className={`w-px ${isFirst ? 'bg-transparent' : 'bg-stone-200/80'}`} style={{ height: 16 }} />

        <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/70 shadow-sm backdrop-blur-sm ring-1 ring-stone-200/70">
          <div className="absolute inset-1.5 rounded-full" style={{ backgroundColor: `${meta.color}18` }} />
          <div
            className="relative flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${meta.color}1f`,
              boxShadow: `inset 0 0 0 1px ${meta.color}40`,
            }}
          >
            <TransportIcon type={step.type} size={16} />
          </div>
        </div>

        {!isLast && (
          <div className="w-px flex-1 bg-stone-200/80" style={{ minHeight: 24 }} />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? 'pb-2' : 'pb-6'} pt-1`}>
        <button
          type="button"
          onClick={handleClick}
          className="group relative w-full max-w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/65 text-left shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur-md ring-1 ring-stone-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_14px_36px_-18px_rgba(15,23,42,0.4)] active:translate-y-0"
        >
          <span
            className="absolute inset-x-4 top-0 h-px opacity-90"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${meta.color}60 18%, ${meta.color}90 50%, ${meta.color}60 82%, transparent 100%)`,
            }}
          />
          <div
            className="absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${meta.color}1c` }}
          />

          <div className="relative px-4 pb-4 pt-4 sm:px-6 sm:pb-5">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${meta.color}18`,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>

                <h4 className="mt-3 break-words text-[17px] font-semibold leading-snug text-stone-800">
                  {step.title}
                </h4>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2 pl-2">
                {step.estimatedDuration && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-200/70">
                    <Clock className="h-3.5 w-3.5 text-stone-500" />
                    {formatDuration(step.estimatedDuration)}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            {(fromLabel || toLabel) && (
              <div className="mt-3.5 rounded-2xl bg-white/75 px-3 py-2.5 ring-1 ring-inset ring-stone-200/70">
                {hasRoute ? (
                  <div className="flex min-w-0 items-center gap-2 text-[13px] text-stone-700">
                    <span className="min-w-0 flex-1 truncate font-medium">{fromLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
                    <span className="min-w-0 flex-1 truncate font-medium">{toLabel}</span>
                  </div>
                ) : (
                  <div className="break-words text-[13px] font-medium text-stone-700">
                    {fromLabel || toLabel}
                  </div>
                )}
              </div>
            )}

            {(step.departureTime || step.arrivalTime) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {step.departureTime && (
                  <span className="rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200/70">
                    Dep. {step.departureTime}
                  </span>
                )}
                {step.arrivalTime && (
                  <span className="rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200/70">
                    Arr. {step.arrivalTime}
                  </span>
                )}
              </div>
            )}
          </div>

          {step.note && (
            <div className="border-t border-white/80 bg-white/55 px-4 py-3 sm:px-6">
              <div className="flex items-start gap-2 text-[13px] leading-relaxed text-stone-600">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
                <span className="min-w-0 break-words">{step.note}</span>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
