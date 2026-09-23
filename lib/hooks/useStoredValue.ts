"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readStoredValue, serverStoredValue, subscribeStoredValues } from "../browser-storage";
export { notifyStorageChanged } from "../browser-storage";

export function useStoredValue(key: string) {
  const getSnapshot = useCallback(() => readStoredValue(key), [key]);
  return useSyncExternalStore(subscribeStoredValues, getSnapshot, serverStoredValue);
}
