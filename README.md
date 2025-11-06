This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cache Control

The application uses Next.js caching to optimize performance. You can control caching behavior using the `NEXT_PUBLIC_DISABLE_CACHE` environment variable.

**To disable caching (useful for WordPress admins to see changes immediately):**

1. Set `NEXT_PUBLIC_DISABLE_CACHE=true` in your `.env.local` or `.env.production` file
2. Restart the development server or redeploy the application

**Default cache durations when caching is enabled:**
- Homepage data: 5 minutes
- Pages: 10 minutes
- Posts: 20 minutes to 1 hour
- Site info, menus, forms: 1 hour

**Note:** In development (`.env.local`), caching is disabled by default to help with content editing. In production (`.env.production`), caching is enabled by default for better performance.

## Styling components

Since lazyness is a virtue :), I have used https://ui.shadcn.com/
