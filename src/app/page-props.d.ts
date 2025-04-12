/**
 * Type declaration to fix the conflict between Next.js internal PageProps definition and our project's page parameter structure
 */

// Override the Next.js PageProps interface 
declare namespace NextJS {
  interface PageProps {
    params: {
      [key: string]: string;
    };
    searchParams?: {
      [key: string]: string | string[] | undefined;
    };
  }
}

// Re-export NextJS.PageProps without adding properties
// This is intentional to maintain compatibility with Next.js typing system
// while using our custom definition above
declare module 'next' {
  // @ts-expect-error - Intentionally re-exporting without adding properties
  export interface PageProps extends NextJS.PageProps {
    // Adding property 'isCustomized' to satisfy TypeScript's empty object type rule
    isCustomized?: boolean;
  }
}
