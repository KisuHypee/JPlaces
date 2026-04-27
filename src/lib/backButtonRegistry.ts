'use client';

/**
 * A simple registry to manage back button actions in the app.
 * Components can register a function that returns 'true' if it handled the back action.
 * Actions are executed in reverse order (LIFO), so the most recently registered
 * action (e.g., a modal or sidebar) takes priority.
 */

type BackAction = () => boolean;
const registry: BackAction[] = [];

export function registerBackAction(action: BackAction) {
  registry.push(action);
  return () => {
    const index = registry.indexOf(action);
    if (index > -1) {
      registry.splice(index, 1);
    }
  };
}

export function executeBackActions(): boolean {
  // Execute from newest to oldest
  for (let i = registry.length - 1; i >= 0; i--) {
    if (registry[i]()) {
      return true;
    }
  }
  return false;
}
