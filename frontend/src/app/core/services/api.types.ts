export interface ApiResponse<T> {
  data: T
  error?: string
  metadata?: Record<string, unknown>
}
