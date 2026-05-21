import { signal, type WritableSignal } from '@angular/core'

interface QueryState<T> {
  data: WritableSignal<T>
  isLoading: WritableSignal<boolean>
  error: WritableSignal<unknown>
  refetch: () => Promise<T>
}

interface MutationState<TVariables, TResult> {
  isPending: WritableSignal<boolean>
  error: WritableSignal<unknown>
  mutateAsync: (variables: TVariables) => Promise<TResult>
}

export function createQueryHook<T>(loader: () => Promise<T>, initialValue: T, enabled = true): QueryState<T> {
  const data = signal(initialValue)
  const isLoading = signal(enabled)
  const error = signal<unknown>(null)

  const refetch = async () => {
    if (!enabled) {
      isLoading.set(false)
      return data()
    }

    isLoading.set(true)
    error.set(null)

    try {
      const result = await loader()
      data.set(result)
      return result
    } catch (err) {
      error.set(err)
      throw err
    } finally {
      isLoading.set(false)
    }
  }

  if (enabled) {
    void refetch()
  }

  return { data, isLoading, error, refetch }
}

export function createMutationHook<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>): MutationState<TVariables, TResult> {
  const isPending = signal(false)
  const error = signal<unknown>(null)

  const mutateAsync = async (variables: TVariables) => {
    isPending.set(true)
    error.set(null)

    try {
      return await mutationFn(variables)
    } catch (err) {
      error.set(err)
      throw err
    } finally {
      isPending.set(false)
    }
  }

  return { isPending, error, mutateAsync }
}

export function useInjected<T>(factory: () => T): T {
  return factory()
}
