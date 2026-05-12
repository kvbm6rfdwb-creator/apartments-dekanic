import { redirect } from 'next/navigation';
// With localePrefix:'always', root / has no locale handler.
// Redirect visitors to the default English locale.
export default function RootPage() {
  redirect('/en');
}
