'use client';

import dynamic from 'next/dynamic';

// Disable SSR for Dashboard to avoid hydration mismatch with Radix UI
const Dashboard = dynamic(
  () => import('@/components/dashboard/dashboard').then((mod) => mod.Dashboard),
  { ssr: false }
);

export function DashboardWrapper() {
  return <Dashboard />;
}

