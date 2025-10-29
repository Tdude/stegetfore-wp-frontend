To Do:

# Cleanup Plan

After implementing the changes to use module components, the following files can be safely deleted:

## Files to Delete

1. `src/components/homepage/HeroSection.tsx`
2. `src/components/homepage/FeaturedPosts.tsx`
3. `src/components/homepage/SellingPoints.tsx`
4. `src/components/homepage/GallerySection.tsx`
5. `src/components/homepage/StatsSection.tsx`
6. `src/components/homepage/TestimonialsSection.tsx`
7. `src/components/homepage/CTASection.tsx` (if it exists)

## Clean-Up Steps

1. Verify that the new homepage with module components works as expected
2. Double-check for any imports of these components in other files before deletion
3. Delete the files listed above
4. Ensure there are no build errors after deletion
5. Test the homepage thoroughly to make sure all features work as expected

## Implementation Order

1. First, implement the HomepageTemplate changes
2. Test the site to ensure functionality works
3. Remove the deprecated files only after confirming everything works

## Note

Keep the files around temporarily in case you need to reference their implementation details during the migration process.

# Implementation Plan

This document outlines the steps to transition from homepage-specific components to module components throughout the application.

## Step 1: Update the HomepageTemplate Component

Replace the current implementation of `src/components/templates/HomepageTemplate.tsx` with the new version that uses `ModuleRenderer` for all content sections.

Key changes:

- Remove imports of homepage-specific components
- Add code to transform homepage data sections into module-compatible format
- Replace direct component usage with `ModuleRenderer` instances

## Step 2: Test the Implementation

1. Run the development server and verify that the homepage renders correctly
2. Check each section (Hero, Featured Posts, Selling Points, etc.) to ensure they appear as expected
3. Test responsive behavior to ensure everything works across different screen sizes
4. Verify that any interactive elements (like carousels, lightboxes, accordions) still function properly

## Step 3: Remove Deprecated Components

Once testing confirms everything works correctly, remove the homepage-specific components:

```bash
# Run these commands to remove the homepage components
rm src/components/homepage/HeroSection.tsx
rm src/components/homepage/FeaturedPosts.tsx
rm src/components/homepage/SellingPoints.tsx
rm src/components/homepage/GallerySection.tsx
rm src/components/homepage/StatsSection.tsx
rm src/components/homepage/TestimonialsSection.tsx
# If it exists:
rm src/components/homepage/CTASection.tsx
```

## Step 4: Final Testing

After removing the files:

1. Ensure the application builds without errors
2. Test the homepage again to verify everything still works
3. Check all page templates to make sure they're properly using module components

## Step 5: Update Documentation

Update any documentation related to:

- Component structure
- Module system usage
- Page template architecture

## Benefits of This Change

1. **Consistency**: Using the same components throughout the application creates a more consistent architecture
2. **Maintainability**: Changes to a component only need to be made in one place
3. **Flexibility**: The modular approach makes it easier to add, remove, or rearrange content sections
4. **Codebase Simplification**: Removing duplicate components reduces the size and complexity of the codebase

5. - Make different layout page choices show

6. Implement core features:

   - Post navigation, number of posts easily adjustable, pagination
   - Categories/taxonomies support
   - Featured images and media handling

7. Add functionality:

   - Loading states
   - Error boundaries
   - SEO optimization

8. Styling and UI:

   - Header/footer design based on WP best practices
   - Post grid layout
   - Responsive design improvements
   - Typography and theme styling

9. Performance:
   - Implement caching strategy
   - Add image optimization
   - Configure static generation where appropriate

I know for a fact after testing that the WPCF7 form handling (submit) works from a simple html page but not this template. Look for bugs.
Remove redundancies and make a utility system which is easy to change, expand and maintain.

Use Tailwind and component styling examples from https://ui.shadcn.com/ where possible! Here are examples of all the endpoint URLs we use for the various features, for context. Many of these are not built yet:

Use Tailwind and component styling examples from https://ui.shadcn.com/ where possible!

Here are examples of all the endpoint URLs we use for the various features:
Homepage Data (Combined Endpoint)

- Original: /wp-json/startpage/v1/homepage-data
- New version: /wp-json/startpage/v2/homepage-data
  Individual Feature Endpoints
  Hero Section
- /wp-json/steget/v1/hero/123 (where 123 is the page ID)
  Featured Posts
- /wp-json/steget/v1/featured-posts
  Testimonials
- /wp-json/steget/v1/testimonials
  Call to Action (CTA)
- /wp-json/steget/v1/cta/123 (where 123 is the page ID)
  Selling Points
- /wp-json/steget/v1/selling-points/123 (where 123 is the page ID)
  Existing Module Endpoints
- Get all modules: /wp-json/steget/v1/modules
- Get specific module: /wp-json/steget/v1/modules/389 (where 456 is the module ID)
- Filter modules by template: /wp-json/steget/v1/modules?template=hero
- Filter modules by category: /wp-json/steget/v1/modules?category=homepage
  Contact Form 7 Endpoints
- Get form structure: /wp-json/steget/v1/cf7/form/789 (where 789 is the form ID)
- Submit form: /wp-json/steget/v1/cf7/submit/789 (POST request)
- Simple submit form: /wp-json/steget/v1/cf7/simple-submit/789 (POST request)
- List all forms: /wp-json/steget/v1/cf7/forms
  WordPress Core Endpoints (for reference)
- Site info: /wp-json/
- Pages: /wp-json/wp/v2/pages
- Posts: /wp-json/wp/v2/posts
- Media: /wp-json/wp/v2/media

These endpoints provide a comprehensive API for the headless WordPress theme, allowing you to access all components independently or as part of the combined homepage data.

After reviewing the codebase, I can see this is a Next.js application serving as a frontend for a WordPress site using a headless CMS approach. The application fetches data from WordPress REST API endpoints and renders it using various templates and components.

# Refactoring Plan

## 1. API Layer Reorganization

The current API functions in `src/lib/api.ts` need to be restructured to support the new endpoints and provide better organization.

## 2. Types Enhancement

Update type definitions to match the new API response structures and create more specific interfaces for the various modules.

## 3. Adapter Functions Improvement

Enhance the adapter functions to properly transform WordPress API responses to the application's internal data structures.

## 4. Component Modularization

Make components more modular so they can be reused across different templates.

## 5. Service Layer Implementation

Create dedicated service files for specific functionality (e.g., form handling, module fetching).

# Implementation Plan

## Files to Create/Modify:

### API Layer

1. **src/lib/api/index.ts**

   - Export all API functions from the specialized files
   - Include the base API fetching utility

2. **src/lib/api/baseApi.ts**

   - `fetchApi(endpoint, options)`: Core function for making API requests
   - `handleApiError(error, endpoint)`: Standardized error handling

3. **src/lib/api/postApi.ts**

   - `fetchPosts(params)`: Get posts with pagination and filtering
   - `fetchPost(slug)`: Get a single post by slug
   - `fetchPostsByIds(ids)`: Get multiple posts by IDs
   - `fetchFeaturedPosts(count)`: Get featured posts

4. **src/lib/api/pageApi.ts**

   - `fetchPages(params)`: Get pages with pagination and filtering
   - `fetchPage(slug)`: Get a single page by slug
   - `fetchPageById(id)`: Get a page by ID

5. **src/lib/api/moduleApi.ts**

   - `fetchModules(params)`: Get all modules with optional filtering
   - `fetchModule(id)`: Get a specific module by ID
   - `fetchModulesByTemplate(template)`: Get modules by template type
   - `fetchModulesByCategory(category)`: Get modules by category

6. **src/lib/api/homepageApi.ts**

   - `fetchHomepageData()`: Get complete homepage data from new v2 endpoint
   - `fetchHeroSection(pageId)`: Get hero section data
   - `fetchFeaturedPostsModule()`: Get featured posts module
   - `fetchTestimonialsModule()`: Get testimonials module
   - `fetchCTASection(pageId)`: Get CTA section data
   - `fetchSellingPoints(pageId)`: Get selling points for a page

7. **src/lib/api/formApi.ts**

   - `fetchFormStructure(formId)`: Get CF7 form structure
   - `submitForm(formId, formData)`: Submit form data to CF7
   - `submitSimpleForm(formId, formData)`: Submit simplified form data

8. **src/lib/api/siteApi.ts**
   - `fetchSiteInfo()`: Get site information
   - `fetchMainMenu()`: Get main menu items
   - `fetchCategories()`: Get all categories

### Types Layer

1. **src/lib/types/index.ts**

   - Export all types from specialized files
   - Include general shared types

2. **src/lib/types/apiTypes.ts**

   - Define general API response structures
   - Define request parameters interfaces

3. **src/lib/types/contentTypes.ts**

   - Define Post, Page, and other content types
   - Update to match new API response structures

4. **src/lib/types/moduleTypes.ts**

   - Define Module interface and specialized module types
   - (HeroModule, CTAModule, SellingPointsModule, etc.)

5. **src/lib/types/formTypes.ts**
   - Define form-related interfaces
   - WPCF7Form, FormField, FormSubmissionResponse, etc.

### Adapter Layer

1. **src/lib/adapters/index.ts**

   - Export all adapters from specialized files

2. **src/lib/adapters/postAdapter.ts**

   - `adaptWordPressPost(wpPost)`: Convert WP post to application Post
   - `adaptWordPressPosts(wpPosts)`: Convert multiple posts

3. **src/lib/adapters/pageAdapter.ts**

   - `adaptWordPressPage(wpPage)`: Convert WP page to application Page
   - `adaptWordPressPageToLocalPage(wpPage)`: Create LocalPage from WP page

4. **src/lib/adapters/moduleAdapter.ts**

   - `adaptWordPressModule(wpModule)`: Convert WP module to application Module
   - Specialized adapters for different module types

5. **src/lib/adapters/formAdapter.ts**
   - `adaptWordPressForm(wpForm)`: Convert WP form to application Form

### Service Layer

1. **src/services/moduleService.ts**

   - Functions for processing and preparing modules for display
   - Handle module composition and combinations

2. **src/services/formService.ts**

   - Form validation
   - Form submission handling
   - Form state management helpers

3. **src/services/imageService.ts**

   - Enhanced image optimization utilities
   - Image size and format selection based on context

4. **src/services/dataService.ts**
   - Data transformation utilities
   - Combine data from multiple endpoints

### Component Enhancements

1. **src/components/modules/ModuleRenderer.tsx**

   - A dynamic component that renders different module types
   - Takes a module type and data, renders appropriate component

2. **src/components/forms/DynamicForm.tsx**

   - Render any CF7 form based on its structure from the API
   - Handle form submission and validation

3. **src/components/layout/ModularPage.tsx**
   - A layout component that renders a page from modules
   - Handles module ordering and layout

### Template Updates

Update various templates to use the new module structure:

1. **src/components/templates/ModularTemplate.tsx**

   - A new template that renders a page using modules from the API

2. **Update existing templates**
   - Modify HomepageTemplate, DefaultTemplate, etc. to use new module structure

This plan provides a comprehensive framework for refactoring the application to work with the new API endpoints while also improving code organization and maintainability. By separating concerns (API calls, type definitions, data adapters, and services), the codebase will be easier to maintain and extend in the future.

Would you like me to start implementing any specific part of this plan, or would you like more details on any particular aspect?
