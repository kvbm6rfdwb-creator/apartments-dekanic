import type { Metadata } from 'next';
import '../globals.css';
export const metadata: Metadata = {
  title: 'Admin · Apartments Dekanić',
  robots: { index: false, follow: false },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-100 min-h-screen font-sans">{children}</body>
    </html>
  );
}
