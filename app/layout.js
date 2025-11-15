'use client'

import './globals.css'
import { Manrope } from 'next/font/google'
import { AuthProvider } from '../lib/auth-context'

const manrope = Manrope({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
