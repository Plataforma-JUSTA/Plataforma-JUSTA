import type { Metadata, Viewport } from 'next';
import { Lato } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import './mobile.css';

const font = Lato({
  weight: ['100', '300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 10,
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'JUSTA Dados',
  description: 'Visualização de dados do JUSTA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={font.className}>
        <Suspense>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
