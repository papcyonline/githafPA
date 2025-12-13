/**
 * UI Components Index
 * Centralized exports for all UI components
 */

// Modal components
export { default as Modal, ConfirmModal, FormModal } from './Modal'
export type { ModalProps, ConfirmModalProps, FormModalProps } from './Modal'

// Error handling
export { ErrorBoundary, ErrorFallback, PageErrorFallback, withErrorBoundary } from './ErrorBoundary'

// Toast notifications
export { ToastProvider, useToast } from './Toast'
export type { Toast, ToastType } from './Toast'

// Loading states
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonWidget,
  SkeletonStats,
  SkeletonTable,
  SkeletonChart,
  WithSkeleton,
} from './Skeleton'
