import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Batch Adjuster | Milk Fat Correction Calculator',
  description: 'Calculate batch adjustments for eggnog and dairy products using Pearson Square and mass balance optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
