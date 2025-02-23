// src/app/page.tsx
import { Suspense } from 'react';
import { fetchPosts, fetchSiteInfo } from '@/lib/api';
import PostCard from '@/components/Postcard';
import { PostSkeletonGrid } from '@/components/PostSkeleton';

async function Posts() {
  const posts = await fetchPosts();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

async function SiteInfo() {
  const siteInfo = await fetchSiteInfo();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{siteInfo.name}</h1>
      <p className="text-gray-600">{siteInfo.description}</p>
    </div>
  );
}

export default function Home() {

  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <Suspense fallback={
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      }>
        <SiteInfo />
      </Suspense>

      <Suspense fallback={<PostSkeletonGrid />}>
        <Posts />
      </Suspense>
    </main>
  );
}
