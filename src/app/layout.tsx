import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brightloop Software — Subscription Management System',
  description: 'Scalable, database-first subscription and recurring billing platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
