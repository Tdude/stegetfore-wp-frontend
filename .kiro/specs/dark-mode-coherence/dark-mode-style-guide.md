# Dark Mode Style Guide

This document outlines the patterns and best practices for implementing dark mode in our application. It serves as a reference for developers to ensure consistent dark mode styling across all components.

## Semantic Color System

Our application uses a three-tier color system:

1. **CSS Custom Properties Layer**: Core color definitions in `globals.css` using HSL values
2. **Tailwind Integration Layer**: Tailwind classes that reference the custom properties
3. **Component Implementation Layer**: Components using semantic color classes

### Implementation Philosophy

Our dark mode implementation follows these core principles:

1. **Semantic Color Variables**: We use semantic color variables (like `--surface-primary`) rather than direct color values to ensure consistency and maintainability.
2. **Theme-Aware Components**: Components should be aware of the current theme and adapt their styling accordingly.
3. **Progressive Enhancement**: Dark mode styling should enhance rather than replace base styles, ensuring graceful degradation.
4. **Accessibility First**: All dark mode styling must maintain or improve accessibility, particularly contrast ratios.
5. **Consistent Visual Hierarchy**: Visual hierarchy should be maintained consistently between light and dark modes.

### CSS Custom Properties

The following semantic color categories are available:

#### Base Colors
- `--background`, `--foreground`: Main background and text colors
- `--card`, `--card-foreground`: Card component colors
- `--primary`, `--primary-foreground`: Primary action colors
- `--secondary`, `--secondary-foreground`: Secondary action colors
- `--muted`, `--muted-foreground`: Muted UI elements
- `--accent`, `--accent-foreground`: Accent highlights
- `--destructive`, `--destructive-foreground`: Error/warning states

#### Semantic Surface Colors
- `--surface-primary`: Main content areas
- `--surface-secondary`: Secondary content areas
- `--surface-tertiary`: Tertiary content areas

#### Panel Colors
- `--panel-background`: Panel backgrounds
- `--panel-border`: Panel borders

#### Text Colors
- `--text-primary`: Main text color
- `--text-secondary`: Secondary text color
- `--text-muted`: Muted text color
- `--text-inverted`: Inverted text color (light on dark, dark on light)

#### Form Colors
- `--form-input-bg`: Form input backgrounds
- `--form-input-border`: Form input borders
- `--form-input-text`: Form input text
- `--form-label`: Form labels
- `--form-placeholder`: Form placeholders
- `--form-focus-ring`: Form focus rings
- `--form-error`: Form error states
- `--form-success`: Form success states

#### Content Colors
- `--content-heading`: Content headings
- `--content-text`: Content text
- `--content-link`: Content links
- `--content-link-hover`: Content link hover states
- `--content-code`: Code text
- `--content-code-bg`: Code backgrounds
- `--content-quote`: Quote text
- `--content-quote-border`: Quote borders

#### Interactive States
- `--hover-overlay`: Hover state overlay
- `--focus-ring`: Focus state ring
- `--active-state`: Active state color

#### Hero Module Colors
- `--hero-overlay`: Hero image overlays
- `--hero-text`: Hero text
- `--hero-text-shadow`: Hero text shadows

## Utility Classes

### Surface Utilities
- `.surface-primary`: Primary surface background
- `.surface-secondary`: Secondary surface background
- `.surface-tertiary`: Tertiary surface background

### Panel Utilities
- `.panel-bg`: Panel background
- `.panel-border`: Panel border

### Text Utilities
- `.text-primary-color`: Primary text color
- `.text-secondary-color`: Secondary text color
- `.text-muted-color`: Muted text color
- `.text-inverted-color`: Inverted text color

### Form Utilities
- `.form-input`: Form input styling
- `.form-label`: Form label styling

### Content Utilities
- `.content-heading`: Content heading styling
- `.content-text`: Content text styling
- `.content-link`: Content link styling
- `.content-code`: Content code styling
- `.content-quote`: Content quote styling

### Hero Module Utilities
- `.hero-overlay`: Hero overlay styling
- `.hero-text`: Hero text styling

### Interactive State Utilities
- `.hover-state`: Hover state styling
- `.active-state`: Active state styling
- `.focus-visible-state`: Focus visible styling

### Dark Mode Specific Utilities
- `.dark-mode-text`: Dark mode text styling
- `.dark-mode-border`: Dark mode border styling
- `.dark-mode-bg`: Dark mode background styling
- `.dark-mode-card`: Dark mode card styling

## Implementation Patterns

Our application supports multiple implementation patterns for dark mode styling. Choose the most appropriate pattern based on your component's complexity and requirements.

### 1. Tailwind Dark Mode Variant (Recommended)

For most components, use Tailwind's built-in dark mode variant. This is the simplest and most maintainable approach:

```tsx
// Simple component using Tailwind dark mode variant
function SimpleCard({ title, description }) {
  return (
    <div className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground 
                    border border-border dark:border-panel-border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-[hsl(var(--content-heading))]">{title}</h3>
      <p className="mt-2 text-secondary dark:text-text-secondary">{description}</p>
    </div>
  );
}
```

### 2. Theme Context Pattern

For components that need more dynamic theme-based styling:

```tsx
// Component using ThemeContext for dynamic styling
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

export function DynamicComponent({ className, title, content, ...props }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div 
      className={cn(
        "rounded-lg p-4", 
        isDarkMode 
          ? "bg-surface-secondary text-text-primary border-panel-border shadow-dark-sm" 
          : "bg-white text-foreground border-border shadow-sm",
        className
      )}
      {...props}
    >
      <h2 className={cn(
        "text-xl font-bold",
        isDarkMode ? "content-heading" : ""
      )}>
        {title}
      </h2>
      <p className={cn(
        "mt-2",
        isDarkMode ? "text-secondary-color" : "text-secondary"
      )}>
        {content}
      </p>
    </div>
  );
}
```

### 3. CSS Custom Properties Pattern

For complex components with custom styling:

```css
/* In your component's CSS or styled-component */
.custom-component {
  background-color: hsl(var(--surface-primary));
  color: hsl(var(--text-primary));
  border: 1px solid hsl(var(--panel-border));
  box-shadow: 0 2px 4px hsl(var(--shadow-color, 0 0% 0% / 0.1));
}

.custom-component:hover {
  background-color: hsl(var(--hover-overlay));
}

.custom-component h2 {
  color: hsl(var(--content-heading));
}

.custom-component p {
  color: hsl(var(--text-secondary));
}
```

### 4. Utility Class Pattern

For components that need consistent styling across multiple instances:

```tsx
// Component using utility classes
function UtilityCard({ title, content }) {
  return (
    <div className="panel-bg panel-border border rounded-lg p-4 shadow-sm">
      <h3 className="content-heading text-lg font-semibold">{title}</h3>
      <p className="text-secondary-color mt-2">{content}</p>
      <button className="hover-state focus-visible-state mt-4 px-4 py-2 rounded">
        Read More
      </button>
    </div>
  );
}
```

### 5. Combined Pattern (For Complex Components)

For complex components like HeroModule that need multiple approaches:

```tsx
// Complex component using combined approach
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

export function ComplexHero({ image, title, description, className }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Dynamic styling based on theme
  const overlayOpacity = isDarkMode ? undefined : 0.3; // Use CSS variable in dark mode
  const imageClass = isDarkMode ? "opacity-80 brightness-[0.85]" : "";
  
  return (
    <div className={cn(
      "relative h-[70vh] overflow-hidden", 
      isDarkMode ? "dark-hero-module" : "",
      className
    )}>
      {/* Image with theme-specific adjustments */}
      <img 
        src={image} 
        alt={title}
        className={cn("absolute inset-0 w-full h-full object-cover", imageClass)}
      />
      
      {/* Overlay with semantic styling */}
      <div 
        className={cn("absolute inset-0", isDarkMode ? "hero-overlay" : "bg-black")}
        style={{ opacity: overlayOpacity }}
      ></div>
      
      {/* Content with semantic text styling */}
      <div className="relative z-10 container mx-auto h-full flex flex-col justify-center items-center text-center">
        <h1 className={cn(
          "text-4xl md:text-6xl font-bold mb-4",
          isDarkMode ? "hero-text" : "text-white"
        )}>
          {title}
        </h1>
        <p className={cn(
          "text-xl max-w-2xl",
          isDarkMode ? "hero-text opacity-90" : "text-white/90"
        )}>
          {description}
        </p>
        
        {/* Button with theme-specific styling */}
        <button className={cn(
          "mt-8 px-6 py-3 rounded-md",
          isDarkMode 
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-dark-sm" 
            : "bg-white text-black hover:bg-white/90 shadow-md"
        )}>
          Learn More
        </button>
      </div>
    </div>
  );
}
```

## Best Practices

1. **Use Semantic Colors**: Always use semantic color variables instead of hardcoded colors
2. **Maintain Contrast**: Ensure text has sufficient contrast against backgrounds (WCAG AA compliance)
3. **Test Both Themes**: Always test components in both light and dark modes
4. **Consistent Patterns**: Follow established patterns for similar components
5. **Avoid Direct Color Values**: Don't use direct hex or RGB values; use the semantic system
6. **Handle Images**: Adjust image brightness/contrast in dark mode for better readability
7. **Smooth Transitions**: Add transitions for theme changes to avoid jarring switches

## Common Issues and Solutions

### Text Readability
- **Issue**: Text is hard to read in dark mode
- **Solution**: Use semantic text colors with proper contrast

### Image Contrast
- **Issue**: Images look too bright in dark mode
- **Solution**: Apply `brightness-[0.85]` and `opacity-90` to images in dark mode

### Border Visibility
- **Issue**: Borders are too subtle or harsh in dark mode
- **Solution**: Use `panel-border` utility class for consistent borders

### Focus States
- **Issue**: Focus indicators are hard to see in dark mode
- **Solution**: Use `focus-visible-state` utility class

## Component-Specific Guidelines

### Buttons
- Use semantic variants: primary, secondary, outline, ghost
- Ensure hover and focus states are visible in dark mode
- Maintain consistent shadows with `shadow-dark-sm` or `shadow-dark-md`

### Cards
- Use `dark-mode-card` utility for consistent styling
- Ensure card content uses proper semantic text colors
- Maintain proper spacing and padding in both themes

### Forms
- Use `form-input` utility for consistent input styling
- Ensure labels are visible with `form-label` utility
- Use proper validation colors with `form-error` and `form-success`

### Hero Modules
- Use `hero-overlay` for consistent overlay styling
- Ensure text is readable with `hero-text` utility
- Adjust image brightness in dark mode for better contrast

## Accessibility Considerations

- Maintain minimum contrast ratio of 4.5:1 for normal text (WCAG AA)
- Ensure interactive elements have visible focus states
- Test with screen readers in both light and dark modes
- Provide sufficient color differentiation for color-blind users

## Real-World Implementation Examples

### Example 1: Button Component

Our button component demonstrates proper dark mode implementation using Tailwind variants and semantic colors:

```tsx
// From src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-state focus-visible-state",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border border-primary hover:bg-primary/90 hover:border-primary/90 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:bg-primary dark:text-primary-foreground dark:border-primary/80 dark:hover:bg-primary/90 dark:focus:ring-primary/70 dark:focus:ring-offset-background",
        secondary:
          "bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary/80 hover:border-secondary/80 shadow-md hover:shadow-lg focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 dark:bg-secondary dark:text-text-primary dark:border-panel-border dark:hover:bg-secondary/60 dark:focus:ring-secondary/70 dark:focus:ring-offset-background",
        // Other variants...
      }
    }
  }
);
```

Key implementation details:
- Uses `dark:` prefix for dark mode specific styles
- Maintains consistent focus states with `dark:focus:ring-primary/70`
- Uses semantic color variables like `dark:text-text-primary`
- Ensures proper contrast with background/text color combinations

### Example 2: Card Component

Our card component shows how to use utility classes for dark mode:

```tsx
// From src/components/ui/card.tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "h-full rounded-lg bg-card text-card-foreground border border-border shadow-sm dark-mode-card",
      className
    )}
    {...props}
  />
))
```

Key implementation details:
- Uses the `dark-mode-card` utility class for consistent styling
- Leverages semantic color variables (`bg-card`, `text-card-foreground`)
- Maintains consistent border styling with `border-border`

### Example 3: HeroModule Component

The HeroModule demonstrates a complex component with dynamic dark mode styling:

```tsx
// From src/components/modules/HeroModule.tsx
export default function HeroModule({ module, className }: HeroModuleProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Enhanced overlay opacity handling for dark mode using semantic variables
  const baseOverlayOpacity = module.overlayOpacity || 0.1;
  
  // Use CSS variables for hero overlay opacity based on theme
  const adjustedOverlayOpacity = isDarkMode 
    ? undefined // We'll use CSS variable in dark mode
    : baseOverlayOpacity;

  // Enhanced text shadow based on theme for better readability
  const textShadowClass = isDarkMode 
    ? "text-shadow-xl" // Stronger shadow in dark mode for better readability
    : "text-hard-shadow-white";

  // Determine image brightness adjustment for dark mode
  const imageOpacityClass = isDarkMode 
    ? "opacity-80 brightness-[0.85]" // Reduce brightness in dark mode for better contrast with text
    : "";
    
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden", 
        heightClass, 
        className,
        isDarkMode ? "dark-hero-module" : ""
      )}
      // Component implementation...
    >
      {/* ... */}
    </section>
  );
}
```

Key implementation details:
- Uses the ThemeContext to detect dark mode
- Applies different styling based on the current theme
- Adjusts image brightness and opacity for better readability in dark mode
- Uses semantic utility classes like `dark-hero-module` and `hero-text`

## Troubleshooting Guide

### Common Dark Mode Issues

#### 1. Inconsistent Colors Between Components

**Symptoms:**
- Components look different in dark mode despite being similar types
- Some components use hardcoded colors while others use semantic variables

**Solutions:**
- Replace hardcoded colors with semantic color variables
- Use utility classes consistently across similar components
- Check for direct hex/RGB values and replace with CSS variables

```diff
- <div className="bg-[#121212] text-white">
+ <div className="bg-background text-foreground">
```

#### 2. Poor Contrast in Dark Mode

**Symptoms:**
- Text is difficult to read against backgrounds
- Interactive elements are hard to distinguish

**Solutions:**
- Use the contrast testing tool in `dark-mode-test.html`
- Ensure text colors have sufficient contrast against backgrounds
- Add subtle shadows or borders to improve element distinction

```tsx
// Adding subtle borders to improve distinction
<div className="dark:border dark:border-panel-border dark:shadow-sm">
  Content
</div>
```

#### 3. Images Too Bright in Dark Mode

**Symptoms:**
- Images appear overly bright and clash with dark backgrounds
- Text overlaid on images is hard to read

**Solutions:**
- Apply brightness and opacity adjustments conditionally:

```tsx
<img 
  src={imageUrl}
  className={cn(
    "object-cover",
    isDarkMode ? "brightness-[0.85] opacity-90" : ""
  )}
  alt="Description"
/>
```

#### 4. Theme Toggle Not Working

**Symptoms:**
- Theme doesn't change when toggle is clicked
- Theme resets on page refresh

**Solutions:**
- Check ThemeContext implementation
- Verify localStorage is being used correctly
- Ensure document.documentElement.classList is being updated

```tsx
// Proper theme toggle implementation
const toggleTheme = () => {
  setTheme((prevTheme) => {
    const newTheme = prevTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    return newTheme;
  });
};
```

#### 5. Focus States Invisible in Dark Mode

**Symptoms:**
- Can't see which element has focus when using keyboard navigation
- Focus rings blend into backgrounds

**Solutions:**
- Use the `focus-visible-state` utility class
- Ensure focus rings have sufficient contrast in dark mode
- Add custom focus styles for dark mode:

```tsx
<button className="focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background dark:focus:ring-primary/70">
  Click Me
</button>
```

## Testing Your Dark Mode Implementation

### Manual Testing Checklist

Before submitting your component, verify:

1. **Theme Toggle:**
   - Component responds correctly to theme changes
   - No flickering or visual glitches during transition

2. **Contrast Ratios:**
   - Text is readable against all backgrounds
   - Interactive elements are distinguishable
   - Run the contrast test in `dark-mode-test.html`

3. **Visual Consistency:**
   - Component matches the design system in both themes
   - Spacing and layout are consistent between themes
   - Borders and shadows maintain proper visual hierarchy

4. **Accessibility:**
   - Component is navigable with keyboard in both themes
   - Focus states are visible in both themes
   - Screen readers can interpret content correctly

5. **Edge Cases:**
   - Component handles long content gracefully
   - Dynamic content updates maintain proper styling
   - Component works with system preference changes

### Automated Testing

We've created testing utilities in `dark-mode-test.js` that you can use:

```javascript
// Import testing utilities
import { 
  testContrastRatios,
  testDarkModeConsistency,
  runDarkModeTests
} from '.kiro/specs/dark-mode-coherence/dark-mode-test.js';

// Run tests on your component
const testResults = runDarkModeTests();
console.log(testResults);
```

## Migration Guide

When updating existing components to support dark mode:

1. **Audit Current Styling:**
   - Identify hardcoded colors
   - Note any custom styling that needs dark variants

2. **Replace Hardcoded Colors:**
   - Replace hex/RGB values with semantic variables
   - Use Tailwind's dark mode variant for simple cases

3. **Add Theme Awareness:**
   - Import ThemeContext if dynamic styling is needed
   - Add conditional classes based on current theme

4. **Test Thoroughly:**
   - Verify component in both themes
   - Check for any regressions in light mode

5. **Document Special Cases:**
   - Note any component-specific dark mode handling
   - Document any deviations from standard patterns

## Conclusion

Following these implementation patterns and guidelines will ensure a consistent, accessible dark mode experience across our application. By using semantic color variables, proper contrast ratios, and consistent styling patterns, we can create a dark mode that enhances usability and aesthetics.

Remember that dark mode is not just an aesthetic choice—it's an accessibility feature that helps users with light sensitivity, reduces eye strain, and can improve battery life on OLED displays. Implementing it correctly is essential for providing an inclusive user experience.