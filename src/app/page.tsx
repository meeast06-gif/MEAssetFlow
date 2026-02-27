'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Loading from './loading';

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/modules');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return <Loading />;
}
