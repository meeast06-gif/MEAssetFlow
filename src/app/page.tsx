'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to the login page on initial load.
    router.replace('/login');
  }, [router]);

  return <Loading />;
}
