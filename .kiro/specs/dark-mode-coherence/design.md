# Design Document

## Overview

This design document outlines the approach to improve dark mode coherence across the WordPress-fed frontend application. The solution focuses on establishing a consistent color system, refactoring existing CSS architecture, and ensuring all components properly implement dark mode styling.

The current implementation has a working theme context and toggle functionality, but lacks consistent color application across components. Many components use hardcoded colors or inconsistent dark mode classes, leading to a fragmented user experience.

## Architecture

### Color System Architecture

The design establishes a three-tier color system:

1. **CSS Custom Properties Layer**: Core color definitions in `globals.css` using HSL values
2. **Tailwind Integration Layer**: Tailwind classes that reference the custom properties
3. **Component Implementation Layer**: Components using semantic color classes

### CSS Custom Properties Enhancement

Expand the existing CSS custom properties system to include:
- Semantic background colors (surface, panel, card)
- Semantic text colors (primary, secondary, muted)
- Semantic border colors (default, subtle, emphasis)
- Interactive state colors (hover, focus, active)

### Component Classification

Components are classified into categories for consistent styling:
- **Layout Components**: Header, Footer, Navigation
- **Content Components**: Modules, Templates, Articles
- **Form Components**: Inputs, Labels, Validation
- **UI Components**: Buttons, Cards, Modals

## Components and Interfaces

### Enhanced CSS Custom Properties

```css
:root {
  /* Existing properties... */
  
  /* Surface colors */
  --surface-primary: 0 0% 100%;
  --surface-secondary: 0 0% 98%;
  --surface-tertiary: 0 0% 96%;
  
  /* Panel colors */
  --panel-background: 0 0% 100%;
  --panel-border: 0 0% 89.8%;
  
  /* Interactive states */
  --hover-overlay: 0 0% 0% / 0.05;
  --focus-ring: 0 0% 3.9%;
}

.dark {
  /* Surface colors */
  --surface-primary: 0 0% 3.9%;
  --surface-secondary: 0 0% 7%;
  --surface-tertiary: 0 0% 10%;
  
  /* Panel colors */
  --panel-background: 0 0% 7%;
  --panel-border: 0 0% 14.9%;
  
  /* Interactive states */
  --hover-overlay: 0 0% 100% / 0.05;
  --focus-ring: 0 0% 83.1%;
}
```

### Tailwind Utility Classes

New utility classes for consistent dark mode implementation:
- `.surface-primary`, `.surface-secondary`, `.surface-tertiary`
- `.panel-bg`, `.panel-border`
- `.text-primary`, `.text-secondary`, `.text-muted`
- `.hover-surface`, `.focus-surface`

### Component-Specific Styling Patterns

#### Navigation Components
- Header: Dark background with light text, consistent dropdown styling
- Footer: Maintain existing dark theme, ensure link contrast
- Dropdowns: Consistent background and border colors

#### Form Components
- Input backgrounds: Use surface-secondary color
- Labels: Use text-primary color
- Validation: Maintain error/success colors with dark mode variants
- Form containers: Use panel-bg and panel-border

#### Content Modules
- Hero modules: Adaptive overlay opacity based on theme
- Text modules: Use surface backgrounds with proper text contrast
- CTA modules: Maintain visual hierarchy with dark-appropriate colors
- Cards: Consistent surface and border styling

## Data Models

### Theme Configuration Model

```typescript
interface ThemeColors {
  surfaces: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  panels: {
    background: string;
    border: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  interactive: {
    hover: string;
    focus: string;
    active: string;
  };
}
```

### Component Style Configuration

```typescript
interface ComponentStyleConfig {
  component: string;
  darkModeClasses: string[];
  customProperties: string[];
  dependencies: string[];
}
```

## Error Handling

### CSS Fallback Strategy

1. **Custom Property Fallbacks**: All custom properties include fallback values
2. **Progressive Enhancement**: Dark mode styles enhance rather than replace base styles
3. **Browser Compatibility**: Graceful degradation for older browsers

### Component Error Handling

1. **Missing Theme Context**: Components render with default light theme
2. **Invalid Color Values**: Fallback to system defaults
3. **CSS Loading Issues**: Base styles ensure readability

## Testing Strategy

### Visual Regression Testing

1. **Component Screenshots**: Before/after comparisons for each component
2. **Theme Toggle Testing**: Verify smooth transitions between themes
3. **Contrast Ratio Validation**: Automated accessibility testing

### Manual Testing Checklist

1. **Navigation Flow**: Test all navigation elements in both themes
2. **Form Interactions**: Verify form usability in dark mode
3. **Content Readability**: Check all text content for proper contrast
4. **Interactive Elements**: Test hover/focus states across components

### Browser Testing

1. **Modern Browsers**: Chrome, Firefox, Safari, Edge
2. **Mobile Devices**: iOS Safari, Android Chrome
3. **Accessibility Tools**: Screen readers, high contrast mode

## Implementation Phases

### Phase 1: CSS Architecture
- Enhance CSS custom properties
- Create utility classes
- Update Tailwind configuration

### Phase 2: Core Components
- Header and navigation components
- Footer component
- Basic UI components (buttons, cards)

### Phase 3: Content Components
- Module components (Hero, Text, CTA)
- Template components
- Form components

### Phase 4: Polish and Testing
- Visual refinements
- Accessibility improvements
- Cross-browser testing

## Design Decisions and Rationales

### CSS Custom Properties Over Hardcoded Colors
**Decision**: Use CSS custom properties for all color definitions
**Rationale**: Enables dynamic theming, reduces duplication, improves maintainability

### Semantic Color Naming
**Decision**: Use semantic names (surface, panel, text) instead of generic names (gray-800)
**Rationale**: Makes intent clear, easier to maintain, supports design system evolution

### Component-Level Dark Mode Classes
**Decision**: Apply dark mode classes at component level rather than globally
**Rationale**: Better encapsulation, easier debugging, more predictable styling

### Gradual Migration Strategy
**Decision**: Refactor components incrementally rather than all at once
**Rationale**: Reduces risk, allows for testing and refinement, maintains development velocity