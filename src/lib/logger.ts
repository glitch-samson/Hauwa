export function logError(context: string, error: unknown): void {
  console.error(`[Parcel] ${context}`, error)
}
