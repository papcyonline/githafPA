'use client'

import './globals.css'
import { Manrope } from 'next/font/google'
import { AuthProvider } from '../lib/auth-context'
import { ToastProvider } from '../components/ui/Toast'
import { ErrorBoundary, PageErrorFallback } from '../components/ui/ErrorBoundary'

const manrope = Manrope({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <ErrorBoundary fallback={<PageErrorFallback error={null} />}>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
