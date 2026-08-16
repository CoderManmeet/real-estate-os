import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from 'react-hot-toast';
import { AmbientBackground } from '@/components/layout/ambient-background';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Real Estate OS — Operating System for Real Estate Agencies',
  description:
    'Manage properties, builders, clients, leads, site visits, documents, invoices and analytics from a single premium operating system.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0d10' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen bg-background text-foreground antialiased">
        <AmbientBackground />
        <div className="relative z-10 min-h-screen">
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: '10px',
                  fontSize: '14px',
                },
              }}
            />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
