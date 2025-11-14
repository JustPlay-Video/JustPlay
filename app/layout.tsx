import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JustPlay - Saturday Morning Cartoons, Reimagined',
  description: 'Streaming service bringing back the magic of Saturday morning cartoons with intentional viewing and fair creator pay.',
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
