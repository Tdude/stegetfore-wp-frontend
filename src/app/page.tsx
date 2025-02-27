// src/app/page.tsx
import { Suspense } from 'react';
import { fetchPosts, fetchFeaturedPosts, fetchCategories, fetchHomepageData, fetchPage } from '@/lib/api';
import { notFound } from 'next/navigation';
import { PostSkeleton } from '@/components/PostSkeleton';
import PageTemplateSelector from '@/components/PageTemplateSelector';

// This is a server component
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
        featured_posts_title: "Featured Articles",
        latest_posts: posts.slice(3), // The rest of the posts
        latest_posts_title: "Latest Posts",
        hero: {
          title: "Ta Steget Före",
          intro: "Upptäck en smartare vardag - för dig och för eleven.",
          buttons: [
            { text: "Upptäck mer", url: "/om-oss", style: "primary" },
            { text: "Kontakta oss", url: "/kontakt", style: "outline" }
          ],
          image: "/images/hero-fallback.jpg" // Provide a fallback image path
        },
        selling_points: [
          {
            id: 1,
            title: "Professionell hjälp",
            description: "We offer high-quality professional services tailored to your needs."
          },
          {
            id: 2,
            title: "Ett team av experter",
            description: "Our team of experts is ready to help you achieve your goals."
          },
          {
            id: 3,
            title: "Fokuserad målbild och resultatuppföljning",
            description: "We're committed to your satisfaction with our work."
          }
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
        title: { rendered: homepageData.hero?.title || 'Welcome' }
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