/**
 * Web Vibration API helper for mobile touch feedback
 * Safe for SSR and unsupported browsers
 */
export function triggerHaptic(duration = 10) {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore errors on devices/browsers that block vibrate
    }
  }
}
