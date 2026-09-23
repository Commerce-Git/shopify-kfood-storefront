export function errorMessage(error: unknown, fallback = "Unexpected error"): string {
  if (error && typeof error === "object" && "message" in error &&
      typeof error.message === "string" && error.message) return error.message;
  return fallback;
}
