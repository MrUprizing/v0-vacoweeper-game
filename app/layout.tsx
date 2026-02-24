import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Vacoweeper - Minesweeper but with Vaco the Dog',
  description: 'A Minesweeper clone themed around Vaco, a black and white spotted dog who hates medicine. Collect treats, avoid pills!',
  generator: 'v0.app',
  openGraph: {
    title: 'Vacoweeper - Minesweeper but with Vaco the Dog',
    description: 'Minesweeper but with Vaco',
    images: [{ url: '/images/vacoweeper-og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vacoweeper - Minesweeper but with Vaco the Dog',
    description: 'Minesweeper but with Vaco',
    images: ['/images/vacoweeper-og-image.png'],
  },
  icons: {
    icon: '/images/vaco-face.jpeg',
    apple: '/images/vaco-face.jpeg',
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#0a0a0a]">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
