// src/app/page.tsx
import { fetchPosts, fetchSiteInfo } from '@/lib/api';
import PostCard from '@/components/Postcard';

export default async function Home() {
  try {
    const [posts, siteInfo] = await Promise.all([
      fetchPosts(),
      fetchSiteInfo()
    ]);

    return (
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{siteInfo.name}</h1>
          <p className="text-gray-600">{siteInfo.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl text-red-600">Kunde inte ladda innehåll.</h1>
        <p className="text-gray-600">Prova igen senare.</p>
      </main>
    );
  }
}