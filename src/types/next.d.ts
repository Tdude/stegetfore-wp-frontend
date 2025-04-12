// src/types/next.d.ts
// Custom type definitions to fix conflict between Next.js and our app's types

// Override the Next.js App Router page props interface to be compatible with our system
declare module 'next' {
  export interface PageProps {
    params: {
      [key: string]: string;
    };
    searchParams?: Record<string, string | string[]>;
  }
}
