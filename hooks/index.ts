/**
 * Hooks Index
 * Central export for all custom hooks
 */

export { useModal, useConfirmModal } from './useModal'
export type { UseModalReturn, UseConfirmModalReturn } from './useModal'

export { useAudioPlayer, formatDuration } from './useAudioPlayer'
export type { AudioPlayerState, UseAudioPlayerReturn } from './useAudioPlayer'

export { useAsyncData, usePaginatedData } from './useAsyncData'
export type {
  AsyncDataState,
  UseAsyncDataOptions,
  UseAsyncDataReturn,
  PaginationState,
  UsePaginatedDataReturn
} from './useAsyncData'
