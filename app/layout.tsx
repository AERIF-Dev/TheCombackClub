import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'The Comeback Club | Give what you can. Get what you need.',description:'Detroit runs on what we do for each other. Exchange skills, discover Comeback Circles, and build a stronger neighborhood.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
