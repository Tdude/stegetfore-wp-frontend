# Netlify Deployment Guide

This guide helps you set up and deploy the Stegetfore WordPress frontend to Netlify.

## Environment Variables

Set these in the Netlify dashboard under Site settings > Build & deploy > Environment:

```
# WordPress API URL
NEXT_PUBLIC_API_URL=https://cms.stegetfore.nu/wp-json

# Theme slug
NEXT_PUBLIC_THEME_SLUG=steget

# Debug mode (set to 'false' in production)
NEXT_PUBLIC_DEBUG=false

# WordPress URL for API proxy
NEXT_PUBLIC_WORDPRESS_URL=https://cms.stegetfore.nu
```

## Build Settings

The correct build settings are already configured in the `netlify.toml` file, including:

- Node.js version 20
- Next.js plugin configuration
- Proper image optimization handling
- API routes configuration

## Troubleshooting

If you encounter build errors:

1. Check the build logs for specific errors
2. Ensure your environment variables are set correctly
3. Verify that the WordPress API is accessible from Netlify
4. Clear the Netlify cache if needed

## Common Issues

- **404 on images:** Make sure the image domains in next.config.js include all sources
- **API connection errors:** Check that NEXT_PUBLIC_API_URL is correctly set
- **TypeScript errors:** These are now ignored in the build thanks to `ignoreBuildErrors: true` in next.config.js
