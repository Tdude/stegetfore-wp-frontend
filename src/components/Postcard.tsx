// src/components/Postcard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Post, Category } from '@/lib/types/contentTypes';

// Define variant types with TypeScript
type PostcardVariant = 'default' | 'compact' | 'featured' | 'full-width';

interface PostcardProps {
  post: Post;
  variant?: PostcardVariant;
  className?: string;
}

// Helper function to safely process categories
const processCategories = (categories?: unknown): Category[] => {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }
  
  return categories.map(category => {
    if (typeof category === 'object' && category !== null) {
      // If it's already a Category-like object
      return {
        id: (category as Category).id || 0,
        name: (category as Category).name || 'Unknown',
        slug: (category as Category).slug || ''
      };
    } else if (typeof category === 'number') {
      // If it's just a category ID
      return {
        id: category,
        name: `Category ${category}`,
        slug: `category-${category}`
      };
    } else if (typeof category === 'string') {
      // If it's a string (unlikely but possible)
      return {
        id: 0,
        name: category,
        slug: category.toLowerCase().replace(/\s+/g, '-')
      };
    }
    
    // Default fallback
    return {
      id: 0,
      name: 'Unknown',
      slug: 'unknown'
    };
  });
};

export default function Postcard({ post, variant = 'default', className = '' }: PostcardProps) {
  // Apply defensive coding to handle potentially missing data
  if (!post) return null;
  
  // Determine which variant is being used
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured' || variant === 'full-width';
  const isFullWidth = variant === 'full-width';
  
  // Extract and safely process categories with proper typing
  const categories = processCategories(post.categories);

  // Clean excerpt for display
  const cleanExcerpt = post.excerpt?.rendered 
    ? post.excerpt.rendered.replace(/<[^>]*>/g, '')
    : '';
  
  // Limit excerpt length based on variant
  const displayExcerpt = isCompact 
    ? ''
    : cleanExcerpt.substring(0, isFullWidth ? 200 : 150) + (cleanExcerpt.length > (isFullWidth ? 200 : 150) ? '...' : '');
  
  return (
    <article 
      className={`transition-all duration-300 h-full
        ${isFeatured 
          ? 'shadow-none bg-white' 
          : 'border rounded-lg overflow-hidden shadow-sm hover:shadow-md bg-white'
        } ${className}`}
    >
      {/* For full-width cards, use a horizontal layout on larger screens */}
      <div className={`${isFullWidth ? 'md:flex' : ''} h-full`}>
        {/* Image Container */}
        <div className={`relative ${isCompact 
          ? 'aspect-[4/3]' 
          : isFullWidth 
            ? 'aspect-[4/3] md:w-1/2' 
            : 'aspect-[4/3]'} overflow-hidden`}>
          {post.featured_image_url ? (
            <Link href={`/posts/${post.slug}`} className="block w-full h-full">
              <Image
                src={post.featured_image_url}
                alt={post.title.rendered.replace(/<[^>]*>/g, '')}
                fill={true}
                sizes={isFeatured 
                  ? "(max-width: 768px) 100vw, 50vw" 
                  : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"}
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority={isFeatured} // Priority loading for featured images
              />
            </Link>
          ) : (
            <Link href={`/posts/${post.slug}`} className="block w-full h-full bg-blue-50 flex items-center justify-center">
              <span className="text-blue-600 font-medium">Read Article</span>
            </Link>
          )}
          
          {/* Categories overlay for featured variant */}
          {isFeatured && categories.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {categories.slice(0, 2).map((category, index) => (
                <Link 
                  key={`cat-${category.id || index}`}
                  href={`/posts/category/${category.slug}`}
                  className="px-2 py-1 bg-white rounded-md text-xs font-medium hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className={`p-4 ${isFullWidth ? 'md:w-1/2 md:p-6 md:flex md:flex-col md:justify-center' : isFeatured ? 'md:p-0 md:pt-6' : ''}`}>
          {/* Date - format if available */}
          {post.date && (
            <div className="text-sm text-gray-600 mb-2">
              {new Date(post.date).toLocaleDateString('sv-SE')}
            </div>
          )}
          
          {/* Categories - Only show here for non-featured cards */}
          {!isFeatured && categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {categories.slice(0, 2).map((category, index) => (
                <Link 
                  key={`cat-${category.id || index}`}
                  href={`/posts/category/${category.slug}`}
                  className="text-xs bg-gray-100 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h2 
            className={`font-bold ${isCompact ? 'text-lg' : isFullWidth ? 'text-2xl' : 'text-xl'} mb-3 text-gray-900`}
          >
            <Link 
              href={`/posts/${post.slug}`}
              className="hover:text-blue-600 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </h2>
          
          {/* Excerpt - hide on compact */}
          {!isCompact && displayExcerpt && (
            <div className={`text-gray-700 ${isFullWidth ? 'line-clamp-4' : 'line-clamp-3'} mb-4`}>
              {displayExcerpt}
            </div>
          )}
          
          {/* Read More link */}
          <Link
            href={`/posts/${post.slug}`}
            className="text-blue-600 font-medium hover:underline inline-flex items-center text-sm mt-auto"
          >
            Läs mer
            <svg 
              className="w-3.5 h-3.5 ml-1" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3.33398 8H12.6673M12.6673 8L8.00065 3.33333M12.6673 8L8.00065 12.6667" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}