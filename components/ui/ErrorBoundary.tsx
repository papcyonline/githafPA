'use client'

/**
 * Error Boundary Component
 * Single Responsibility: Catch and handle React errors gracefully
 *
 * Features:
 * - Catches JavaScript errors in child components
 * - Displays fallback UI
 * - Error reporting
 * - Recovery option
 */

import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // TODO: Send to error reporting service (e.g., Sentry)
    // reportError(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys changed
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-white">Something went wrong</h3>

        <p className="text-gray-400 text-sm">
          {error?.message || 'An unexpected error occurred'}
        </p>

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        )}

        {/* Show stack trace in development */}
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
              Show details
            </summary>
            <pre className="mt-2 p-3 bg-black/50 rounded-lg text-xs text-red-300 overflow-auto max-h-[200px]">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Page Error Fallback
 * Full-page error display
 */
export function PageErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Illustration */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Oops! Something broke</h1>
          <p className="text-gray-400">
            We&apos;re sorry, but something went wrong. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full font-semibold transition-colors"
            >
              Try Again
            </button>
          )}
          <a
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-semibold transition-colors"
          >
            Go Home
          </a>
        </div>

        {/* Error details for developers */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-sm font-medium text-red-400 mb-2">Error Details:</p>
            <p className="text-sm text-red-300">{error.message}</p>
            {error.stack && (
              <pre className="mt-2 text-xs text-red-300/70 overflow-auto max-h-[150px]">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * withErrorBoundary HOC
 * Wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
