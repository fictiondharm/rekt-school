'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CertificateIndex() {
  const router = useRouter();

  useEffect(() => {
    // Generate or route to default student cert
    router.replace('/certificate/quest-basic-2026');
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-12 text-sm font-medium text-ink-soft">
      Loading Certificate...
    </div>
  );
}
