import type { Metadata } from 'next';
import { Cormorant_Garamond, M_PLUS_Rounded_1c } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const mplus = M_PLUS_Rounded_1c({
  variable: '--font-mplus',
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hungarian Learning',
  description: 'Minimalist Hungarian vocabulary learning for Japanese speakers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          cormorant.variable,
          mplus.variable,
          'font-sans text-text antialiased'
        )}
      >
        <div className="bg-background min-h-screen font-sans">{children}</div>
      </body>
    </html>
  );
}
