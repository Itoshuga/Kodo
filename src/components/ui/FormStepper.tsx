interface FormStepperProps {
  total: number;
  current: number;
}

export function FormStepper({ total, current }: FormStepperProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-100 sm:w-32">
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-stone-400">
        {current + 1}/{total}
      </span>
    </div>
  );
}
