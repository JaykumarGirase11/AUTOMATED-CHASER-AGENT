import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Automated Chaser Agent | Smart Task Reminders',
  description: 'Intelligent automated reminder system that eliminates manual follow-ups by sending personalized reminders - acting like a human program manager.',
  keywords: ['task management', 'reminders', 'automation', 'productivity', 'deadline tracking'],
  authors: [{ name: 'Jay Kumar' }],
  openGraph: {
    title: 'Automated Chaser Agent',
    description: 'Smart automated reminders for your team',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
