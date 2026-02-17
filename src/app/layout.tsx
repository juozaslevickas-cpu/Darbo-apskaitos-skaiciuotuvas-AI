import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/layout/LayoutShell';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'Darbo laiko apskaita',
  description: 'Darbo laiko apskaitos skaičiuotuvas pagal LR Darbo kodeksą',
  openGraph: {
    title: 'Darbo laiko apskaita',
    description: 'Darbo laiko apskaitos skaičiuotuvas pagal LR Darbo kodeksą',
    type: 'website',
    locale: 'lt_LT',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
