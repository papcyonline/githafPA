/**
 * useModal Hook
 * Single Responsibility: Manage modal open/close state
 */

import { useState, useCallback } from 'react'

export interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return { isOpen, open, close, toggle }
}

/**
 * useConfirmModal Hook
 * For confirmation dialogs with callback
 */
export interface UseConfirmModalReturn<T = void> {
  isOpen: boolean
  data: T | null
  open: (data?: T) => void
  close: () => void
  confirm: () => void
}

export function useConfirmModal<T = void>(
  onConfirm: (data: T | null) => void | Promise<void>
): UseConfirmModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<T | null>(null)

  const open = useCallback((newData?: T) => {
    setData(newData ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setData(null)
  }, [])

  const confirm = useCallback(async () => {
    await onConfirm(data)
    close()
  }, [data, onConfirm, close])

  return { isOpen, data, open, close, confirm }
}
