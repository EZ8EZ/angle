import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANGLE — Daily Geometry',
  description: 'A daily geometry guessing game. Set the line to match the hidden angle.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
