import { LayoutGrid, List } from 'lucide-react';
import type { ViewMode } from '../types';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5" role="group" aria-label="View mode">
      <button
        type="button"
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
          value === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <List className="h-4 w-4" aria-hidden="true" />
        List
      </button>
      <button
        type="button"
        onClick={() => onChange('board')}
        aria-pressed={value === 'board'}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
          value === 'board' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        Board
      </button>
    </div>
  );
}
