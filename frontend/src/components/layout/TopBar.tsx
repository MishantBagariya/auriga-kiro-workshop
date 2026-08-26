import { Menu } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

/**
 * Mobile-only top bar carrying the sidebar toggle. Hidden on desktop,
 * where the sidebar is persistent (structure.md, product.md).
 */
export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded p-1 text-gray-600 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <span className="text-base font-semibold text-gray-900">TaskFlow</span>
    </div>
  );
}
