import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Loan Management System',
  description: 'Complete loan management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="bottom-center" 
          containerClassName="sm:!justify-end sm:!px-8 sm:!pb-8"
          toastOptions={{
            className: '!max-w-[90vw] sm:!max-w-[400px] !text-xs sm:!text-sm !p-3 sm:!p-4 !rounded-2xl !mb-4 sm:!mb-0',
            style: {
              background: 'rgba(30, 41, 59, 0.95)', // slate-800 with opacity
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              fontWeight: '600',
            },
            success: {
              iconTheme: {
                primary: '#10b981', // emerald-500
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e', // rose-500
                secondary: '#fff',
              },
            },
          }} 
        />
      </body>
    </html>
  )
}
