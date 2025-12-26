import { getSchema } from '@/app/actions';
import { Dashboard } from '@/components/dashboard/dashboard';

export default async function Home() {
  // Fetch the database schema on the server to avoid client-side waterfalls.
  // This improves initial page load performance.
  const schema = await getSchema().catch((err) => {
    console.error('Failed to load database schema:', err);
    // Return an empty array on failure to prevent the page from crashing.
    // The UI will show a message indicating that tables could not be loaded.
    return [];
  });

  return <Dashboard schema={schema} />;
}
