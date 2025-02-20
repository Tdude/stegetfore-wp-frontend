// src/app/test/page.tsx
import { fetchPosts } from '@/lib/api';

export default async function TestPage() {
    try {
        const posts = await fetchPosts();

        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(posts, null, 2)}
                </pre>
            </div>
        );
    } catch (error) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                <pre className="bg-red-100 p-4 rounded">
                    {error instanceof Error ? error.message : 'Unknown error'}
                </pre>
            </div>
        );
    }
}