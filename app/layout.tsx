import "./globals.css";
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

 
const inter = Inter({ subsets: ['latin'], weight: '400' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <head>
        <title>DentAssist</title>
      </head>
      <body>
          {children}
          <SpeedInsights />
          <Analytics />
      </body>
    </html>
  );
}