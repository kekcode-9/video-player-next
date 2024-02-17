import type { Metadata } from 'next'
import { Inter } from 'next/font/google';
import './globals.css';
import VideoContextProvider from '@/store/videocontext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://video-playlist-next.vercel.app/'),
  title: 'Video Player with Next.js',
  description: 'A responsive video player with draggable and sortable playlist. Built with Next 13 & Typescript.',
  openGraph: {
    title: 'A responsive video player with draggable and sortable playlist. Built with Next 13 & Typescript.',
    description: '',
    url: 'https://video-playlist-next.vercel.app/',
    siteName: 'Video Player Silk',
    type: 'website'
  }
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body 
        className={`
          ${inter.className} bg-dark-charcoal overflow-x-hidden overflow-y-scroll
        `}
      >
        <VideoContextProvider>
          {children}
        </VideoContextProvider>
      </body>
    </html>
  )
}
