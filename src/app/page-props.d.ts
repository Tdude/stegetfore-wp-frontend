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

// Export the PageProps type to be used in page components
declare module 'next' {
  export interface PageProps extends NextJS.PageProps {}
}
