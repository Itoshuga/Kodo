import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-300">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-stone-700">{title}</h3>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-stone-500">{description}</p>
      {action}
    </div>
  );
}
