import './globals.css';
import { Metadata } from 'next';
import ToasterProvider from '@/components/ToasterProvider';

export const metadata: Metadata = {
  title: 'Brightloop — Subscription Management & Billing SaaS',
  description: 'Enterprise-grade recurring billing, subscription lifecycle, and revenue analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('brightloop_theme');
                if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
