import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/api/auth/signin?callbackUrl=%2Fchat');
}
