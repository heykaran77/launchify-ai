import type { Metadata } from 'next';
import { Geist, Geist_Mono, Figtree } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { ModeToggle } from '@/components/common/ModeToggle';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Launchify AI - Generate Startup Pitches from GitHub Repos',
  description:
    'Turn your GitHub repository into a compelling startup pitch with AI-powered analysis, multilingual translation, and voice generation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skiper UI Theme Toggle - Fixed Top Right */}
          <div className="fixed top-6 right-6 z-50">
            <ModeToggle />
          </div>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
