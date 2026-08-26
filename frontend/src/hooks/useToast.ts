import { useToastContext } from '../components/ui/Toast';

/**
 * Write-only from callers: fire a toast and forget it. Wraps the
 * toast context so feature code imports a hook, not a component file.
 */
export function useToast() {
  return useToastContext();
}
