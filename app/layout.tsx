import type { Metadata } from 'next';
import './globals.css';
const title = 'The Comeback Club | Old-school barter. New connections.';
const description = 'Your skills have value. Your neighbors have needs. Trade what you can do for what you need — no cash required. Rooted in Detroit.';
export const metadata: Metadata = {
  metadataBase: new URL('https://the-comeback-club-detroit.famous-tulip-4183.chatgpt.site'),
  title, description, applicationName: 'The Comeback Club',
  icons: { icon: '/favicon.svg', apple: '/branding/comeback-club-logo.png' },
  openGraph: { title, description, siteName: 'The Comeback Club', type: 'website', images: [{ url: '/branding/comeback-club-logo.png', width: 1536, height: 1024, alt: 'The Comeback Club official logo' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/branding/comeback-club-logo.png'] },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
