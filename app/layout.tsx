import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apartmentsdekanic.com';

export const metadata: Metadata = {
  title: { default: 'Apartments Dekanić | Baška, Island Krk', template: '%s | Apartments Dekanić' },
  description: 'Book directly and save — beautiful apartments in Baška, Island Krk, Croatia. No fees, best price guaranteed.',
  metadataBase: new URL(SITE_URL),
  keywords: ['apartments Baška', 'Krk island holiday', 'Croatia sea view apartment', 'direct booking Croatia', 'Dekanić Baška'],
  authors: [{ name: 'Apartments Dekanić' }],
  openGraph: {
    title: 'Apartments Dekanić | Baška, Island Krk',
    description: 'Book directly — beautiful sea-view apartments in Baška, Krk. No fees, best price guaranteed.',
    url: SITE_URL,
    siteName: 'Apartments Dekanić',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Apartments Dekanić — Baška, Island Krk' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apartments Dekanić | Baška, Island Krk',
    description: 'Sea-view apartments in Baška, Island Krk. Book direct — no fees.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#b97a3a" />
      </head>
      <body className="bg-sand-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
