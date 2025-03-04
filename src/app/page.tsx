// src/app/page.tsx
import { Suspense } from 'react';
import { fetchPosts, fetchCategories, fetchHomepageData, fetchPage } from '@/lib/api';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';

export default async function HomePage() {
  try {
    // Fetch homepage data first as our primary content source
    let homepageData;
    let page;

    try {
      // Fetch the homepage from WP API
      homepageData = await fetchHomepageData();

      // Also fetch the page that might be set as homepage in WordPress
      page = await fetchPage('home');
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }

    // Fallback if homepage data fetch fails
    if (!homepageData) {
      // Fetch basic data that we know should work
      const posts = await fetchPosts();
      const categories = await fetchCategories();

      // Use the first 3 posts as featured
      const featuredPosts = posts.slice(0, 3);

      // Create a minimal homepage data structure
      homepageData = {
        featured_posts: featuredPosts,
        featured_posts_title: "Artiklar i fokus",
        latest_posts: posts.slice(3), // The rest of the posts
        latest_posts_title: "Senaste inläggen",
        hero: {
          title: "Ta Steget Före",
          intro: "Upptäck en smartare vardag - för dig och för eleven.",
          buttons: [
            { text: "Upptäck mer", url: "/om-oss", style: "primary" as const },
            { text: "Kontakta oss", url: "/kontakt", style: "outline" as const }
          ],
          image: "https://stegetfore.nu/wp-content/uploads/2024/09/framsida.png" // Provide a fallback image path
        },
        selling_points: [
          {
            id: 1,
            title: "Professionell hjälp",
            description: "Vi erbjuder ditten och datten samt dutten.",
            content: ""
          },
          {
            id: 2,
            title: "Hejsan svejsan",
            description: "Vi erbjuder ditten och datten samt dutten.",
            content: ""
          },
          {
            id: 3,
            title: "Inte professionell hjälp",
            description: "Vi erbjuder ditten och datten samt dutten.",
            content: ""
          },
        ],
        categories: categories
      };
    }

    // Create a page object if none was fetched
    if (!page) {
      page = {
        type: 'homepage',
        template: 'homepage', // Set template explicitly
        id: 0,
        slug: 'home',
        title: { rendered: homepageData.hero?.title ?? 'Welcome' },
        chartData: { segments: [] }, // Add default or mock data for chartData
        excerpt: { rendered: '' }, // Add default or mock data for excerpt
        content: { rendered: '' } // Add default or mock data for content
      };
    }

    // Pass the data to the page template
    return (
      <Suspense fallback={<div className="h-screen bg-muted/30 animate-pulse"></div>}>
        <PageTemplateSelector
          page={page}
          isHomePage={true}
          homepageData={homepageData}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error rendering homepage:", error);
    return notFound();
  }
}