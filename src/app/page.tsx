import { Dashboard } from '@/components/dashboard/dashboard';

export default async function Home() {
  // The schema is no longer needed on the home page as the dashboard is now pre-configured.
  return <Dashboard schema={[]} />;
}
