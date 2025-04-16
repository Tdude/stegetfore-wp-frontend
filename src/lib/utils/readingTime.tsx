// src/lib/utils/readingTime.tsx
/**
 * Calculate estimated reading time for content
 * @param {string} content - HTML content of the post
 * @param {number} wordsPerMinute - Average reading speed (default 200 wpm)
 * @returns {number} - Reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
    // Defensive coding to handle null or undefined content
    if (!content) return 1;
    
    try {
      // Remove HTML tags
      const text = content.replace(/<\/?[^>]+(>|$)/g, '');
      
      // Count words (split by spaces and filter out empty strings)
      const words = text.split(/\s+/).filter(Boolean).length;
      
      // Calculate reading time
      const minutes = Math.ceil(words / wordsPerMinute);
      
      // Return at least 1 minute
      return Math.max(1, minutes);
    } catch (error) {
      console.error('Error calculating reading time:', error);
      return 1; // Default to 1 minute on error
    }
  }
  