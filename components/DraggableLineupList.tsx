'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * DraggableLineupList component for reordering shows in a lineup
 * Uses @dnd-kit for accessible drag-and-drop functionality
 *
 * @component
 * @param {Show[]} shows - Array of shows in the lineup
 * @param {string} lineupId - ID of the lineup being edited
 * @example
 * ```tsx
 * <DraggableLineupList shows={lineupShows} lineupId="123" />
 * ```
 */

interface Show {
  id: string;
  title: string;
  thumbnail_url: string | null;
  position: number;
}

interface DraggableLineupListProps {
  shows: Show[];
  lineupId: string;
}

function SortableShow({ show, onRemove }: { show: Show; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: show.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>

      {/* Thumbnail */}
      <div className="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
        {show.thumbnail_url && (
          <img
            src={show.thumbnail_url}
            alt={show.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {show.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Position {show.position}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function DraggableLineupList({ shows, lineupId }: DraggableLineupListProps) {
  const router = useRouter();
  const [items, setItems] = useState(shows);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setItems(newItems);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/lineups/${lineupId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_ids: newItems.map(item => item.id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to reorder:', error);
      setItems(shows);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (showId: string) => {
    if (!confirm('Remove this show from the lineup?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lineups/${lineupId}/shows?show_id=${showId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove show');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to remove show:', error);
      alert('Failed to remove show');
    }
  };

  return (
    <div className="space-y-3">
      {isSaving && (
        <div className="text-sm text-blue-600 dark:text-blue-400">
          Saving order...
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map(show => (
            <SortableShow
              key={show.id}
              show={show}
              onRemove={() => handleRemove(show.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
