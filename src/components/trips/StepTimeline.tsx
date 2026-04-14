import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { TripStep } from '../../types/trip';
import { StepItem } from './StepItem';

interface StepTimelineProps {
  steps: TripStep[];
  tripId: string;
  onReorder?: (steps: TripStep[]) => Promise<void> | void;
  isReordering?: boolean;
}

interface SortableStepRowProps {
  step: TripStep;
  tripId: string;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
}

function SortableStepRow({
  step,
  tripId,
  isFirst,
  isLast,
  disabled,
}: SortableStepRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: step.id,
    disabled,
  });
  const lockedTransform = transform ? { ...transform, x: 0 } : null;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(lockedTransform),
        transition,
      }}
      className={`min-w-0 ${isDragging ? 'opacity-80' : ''}`}
    >
      <div className="relative">
        <StepItem
          step={step}
          tripId={tripId}
          isFirst={isFirst}
          isLast={isLast}
        />
        <span
          role="button"
          aria-label={`Réordonner l'étape ${step.order + 1}`}
          className={`absolute right-3 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/80 bg-white/95 text-stone-400 shadow-sm backdrop-blur-sm transition-colors ${
            disabled
              ? 'cursor-not-allowed opacity-55'
              : 'touch-none cursor-grab active:cursor-grabbing hover:text-stone-600'
          }`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

export function StepTimeline({
  steps,
  tripId,
  onReorder,
  isReordering = false,
}: StepTimelineProps) {
  const sorted = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps]
  );
  const [orderedSteps, setOrderedSteps] = useState(sorted);
  const [activeId, setActiveId] = useState<string | null>(null);
  const canReorder = Boolean(onReorder) && orderedSteps.length > 1;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 170,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setOrderedSteps(sorted);
  }, [sorted]);

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!canReorder || isReordering || !onReorder) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const previous = orderedSteps;
    const oldIndex = previous.findIndex((step) => step.id === String(active.id));
    const newIndex = previous.findIndex((step) => step.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(previous, oldIndex, newIndex).map((step, index) => ({
      ...step,
      order: index,
    }));
    setOrderedSteps(next);

    try {
      await onReorder(next);
    } catch {
      setOrderedSteps(sorted);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedSteps.map((step) => step.id)}
        strategy={verticalListSortingStrategy}
      >
        <div role="list" aria-label="Étapes du trajet" className="w-full min-w-0 overflow-x-hidden">
          {orderedSteps.map((step, i) => (
            <div
              role="listitem"
              key={step.id}
              className={`min-w-0 transition-opacity ${activeId === step.id ? 'opacity-90' : 'opacity-100'}`}
            >
              <SortableStepRow
                step={step}
                tripId={tripId}
                isFirst={i === 0}
                isLast={i === orderedSteps.length - 1}
                disabled={!canReorder || isReordering}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
