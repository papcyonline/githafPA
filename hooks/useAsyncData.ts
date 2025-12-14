/**
 * useAsyncData Hook
 * Single Responsibility: Manage async data fetching state
 *
 * Features:
 * - Loading state
 * - Error handling
 * - Refetch capability
 * - Automatic fetch on mount
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface AsyncDataState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isInitialLoading: boolean
  isRefetching: boolean
}

export interface UseAsyncDataOptions {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

export interface UseAsyncDataReturn<T> extends AsyncDataState<T> {
  refetch: () => Promise<void>
  reset: () => void
  setData: (data: T | null) => void
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
  } = options

  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    error: null,
    isLoading: enabled,
    isInitialLoading: enabled,
    isRefetching: false,
  })

  const mountedRef = useRef(true)
  const fetchCountRef = useRef(0)

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return

    const fetchId = ++fetchCountRef.current

    setState(prev => ({
      ...prev,
      isLoading: true,
      isRefetching: isRefetch,
      error: null,
    }))

    try {
      const data = await fetcher()

      // Prevent state update if component unmounted or newer fetch started
      if (!mountedRef.current || fetchId !== fetchCountRef.current) return

      setState({
        data,
        error: null,
        isLoading: false,
        isInitialLoading: false,
        isRefetching: false,
      })

      onSuccess?.(data)
    } catch (err) {
      if (!mountedRef.current || fetchId !== fetchCountRef.current) return

      const error = err instanceof Error ? err : new Error('Unknown error')

      setState(prev => ({
        ...prev,
        error,
        isLoading: false,
        isInitialLoading: false,
        isRefetching: false,
      }))

      onError?.(error)
    }
  }, [enabled, fetcher, onSuccess, onError])

  // Initial fetch and dependency changes
  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
    }
  }, [...deps, enabled])

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(() => {
      fetchData(true)
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, enabled, fetchData])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isInitialLoading: false,
      isRefetching: false,
    })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  return {
    ...state,
    refetch,
    reset,
    setData,
  }
}

/**
 * usePaginatedData Hook
 * For paginated data fetching
 */
export interface PaginationState {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface UsePaginatedDataReturn<T> extends UseAsyncDataReturn<T[]> {
  pagination: PaginationState
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  setLimit: (limit: number) => void
}

export function usePaginatedData<T>(
  fetcher: (pagination: PaginationState) => Promise<{ data: T[]; total: number }>,
  deps: unknown[] = [],
  initialLimit = 20
): UsePaginatedDataReturn<T> {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    hasMore: false,
  })

  const fetchWithPagination = useCallback(async () => {
    const result = await fetcher(pagination)
    setPagination(prev => ({
      ...prev,
      total: result.total,
      hasMore: prev.page * prev.limit < result.total,
    }))
    return result.data
  }, [fetcher, pagination.page, pagination.limit])

  const asyncData = useAsyncData(fetchWithPagination, [...deps, pagination.page, pagination.limit])

  const nextPage = useCallback(() => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }, [pagination.hasMore])

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }, [pagination.page])

  const goToPage = useCallback((page: number) => {
    if (page >= 1) {
      setPagination(prev => ({ ...prev, page }))
    }
  }, [])

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  return {
    ...asyncData,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
  }
}
