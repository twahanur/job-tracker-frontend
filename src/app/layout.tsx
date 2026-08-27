import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Job Recruitment Tracker — AI Career Management Suite',
  description: 'AI-Powered Job Recruitment Tracking & Multi-Dimensional Resume Matcher',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#EDEDF0] text-[#151E23] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

