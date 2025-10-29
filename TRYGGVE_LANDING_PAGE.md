# Tryggve Landing Page Documentation

## Overview

This is a complete landing page implementation for the Tryggve course based on the OpenAI-generated content strategy. The landing page is designed to convert school leaders (rektorer, specialpedagoger, elevhälsoteam) into course participants.

## Structure

The landing page consists of 7 main sections:

### 1. **Hero Section** (`TryggveHeroSection`)
- **Purpose**: Capture attention and communicate the core value proposition
- **Content**: Main headline, subtitle, and CTA buttons
- **Features**: Background image support, customizable colors

### 2. **Target Audience Section** (`TryggveTargetAudienceSection`)
- **Purpose**: Clarify who the course is for and what they'll gain
- **Content**: Title, description, bullet points, and testimonial
- **Features**: Checkmark list, testimonial quote box

### 3. **Problem Section** (`TryggveProblemSection`)
- **Purpose**: Present the problem with compelling statistics
- **Content**: Statistics cards and closing statement
- **Features**: 3-column grid layout with hover effects

### 4. **Solution Section** (`TryggveSolutionSection`)
- **Purpose**: Introduce the Tryggve model as the solution
- **Content**: Features with icons and descriptions
- **Features**: 3-column grid with hover animations

### 5. **Course Offer Section** (`TryggveCourseSection`)
- **Purpose**: Detail what participants will learn
- **Content**: Course benefits and CTA button
- **Features**: Checkmark list, prominent CTA button
- **ID**: `#course` (for anchor linking)

### 6. **Contact Form Section** (`TryggveContactFormSection`)
- **Purpose**: Collect interest registrations
- **Content**: Form fields (name, email, role, message)
- **Features**: Form validation, success state, toast notifications
- **ID**: `#contact` (for anchor linking)

### 7. **Closing Section** (`TryggveClosingSection`)
- **Purpose**: Reinforce the message with a memorable quote
- **Content**: Quote and attribution

## Files Created

### Types
- `/src/lib/types/tryggveLandingTypes.ts` - TypeScript interfaces for all sections

### Components
- `/src/components/tryggve/TryggveHeroSection.tsx`
- `/src/components/tryggve/TryggveTargetAudienceSection.tsx`
- `/src/components/tryggve/TryggveProblemSection.tsx`
- `/src/components/tryggve/TryggveSolutionSection.tsx`
- `/src/components/tryggve/TryggveCourseSection.tsx`
- `/src/components/tryggve/TryggveContactFormSection.tsx`
- `/src/components/tryggve/TryggveClosingSection.tsx`
- `/src/components/tryggve/index.ts` - Barrel export

### Template
- `/src/components/templates/TryggveLandingTemplate.tsx` - Main template that combines all sections

## Usage

### Option 1: Use with Default Content

The template comes with pre-populated Swedish content based on the OpenAI output:

```tsx
import TryggveLandingTemplate from '@/components/templates/TryggveLandingTemplate';

<TryggveLandingTemplate page={page} />
```

### Option 2: Customize Content via Props

You can override the default content by passing custom data:

```tsx
import TryggveLandingTemplate from '@/components/templates/TryggveLandingTemplate';
import { TryggveLandingData } from '@/lib/types/tryggveLandingTypes';

const customData: TryggveLandingData = {
  hero: {
    title: 'Your Custom Title',
    subtitle: 'Your custom subtitle',
    buttons: [
      { text: 'CTA Button', url: '#contact', style: 'primary' }
    ],
    backgroundColor: '#a4e87a'
  },
  // ... other sections
};

<TryggveLandingTemplate page={page} landingData={customData} />
```

### Option 3: Use Individual Sections

You can also use individual sections in your own layouts:

```tsx
import { 
  TryggveHeroSection, 
  TryggveContactFormSection 
} from '@/components/tryggve';

<TryggveHeroSection data={heroData} />
<TryggveContactFormSection data={formData} id="contact" />
```

## Integration with WordPress

To integrate this landing page with WordPress:

1. **Create a new page template** in WordPress admin
2. **Assign the template** to a page (e.g., `/tryggve-kurs`)
3. **Update PageTemplateSelector** to recognize the new template:

```tsx
// In src/components/PageTemplateSelector.tsx
import TryggveLandingTemplate from '@/components/templates/TryggveLandingTemplate';

// Add to template mapping:
case 'tryggve-landing': // TODO: Update this to match template slug, possibly tryggve-demo
  return <TryggveLandingTemplate page={page} />;
```

4. **Optional: Store content in WordPress ACF fields** instead of using defaults

## Styling

The landing page uses:
- **Tailwind CSS** for styling
- **Semantic color tokens** from your theme (e.g., `surface-primary`, `content-heading`)
- **Responsive design** with mobile-first approach
- **Dark mode support** via theme context

## Form Submission

The contact form currently simulates submission. To implement real submission:

1. **Option A: WordPress Contact Form 7**
   - Create a CF7 form in WordPress
   - Update `TryggveContactFormSection.tsx` to use the CF7 API

2. **Option B: Custom API endpoint**
   - Create an API route in `/src/app/api/tryggve-contact/route.ts`
   - Update the `handleSubmit` function to POST to this endpoint

3. **Option C: Third-party service**
   - Integrate with services like Mailchimp, HubSpot, or SendGrid

## Customization

### Colors
Update colors in the data object or via Tailwind classes:

```tsx
backgroundColor: '#your-color'
```

### Icons
The solution section uses emoji icons. Replace with:
- SVG icons from libraries like Lucide React
- Custom SVG files
- Icon fonts

### Typography
The page uses your existing font setup:
- **Headings**: `font-heading` (Raleway)
- **Body**: `font-sans` (Lato)

## SEO Considerations

For better SEO, consider adding:
- Meta tags (title, description, OG tags)
- Structured data (JSON-LD for Course schema)
- Alt text for images
- Semantic HTML (already implemented with proper heading hierarchy)

## Accessibility

The landing page includes:
- Proper heading hierarchy (h1 → h2 → h3)
- Form labels and required field indicators
- Keyboard navigation support
- Focus states on interactive elements
- Semantic HTML elements

## Next Steps

1. **Test the landing page** in your development environment
2. **Customize content** to match your exact needs
3. **Implement form submission** to your preferred backend
4. **Add tracking** (Google Analytics, Facebook Pixel, etc.)
5. **A/B test** different headlines and CTAs
6. **Optimize images** for performance
7. **Add animations** if desired (using Framer Motion or similar)

## Support

For questions or issues, refer to:
- Main project README
- Component documentation in each file
- TypeScript interfaces for data structure
