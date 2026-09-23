export const STORAGE_CHANGED_EVENT = "blank-seoul-storage";

export function notifyStorageChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(STORAGE_CHANGED_EVENT));
}

export function subscribeStoredValues(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_CHANGED_EVENT, onChange);
  };
}

export function readStoredValue(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

// Hydration must start with the same snapshot as server rendering.
export const serverStoredValue = (): null => null;
