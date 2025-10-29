/**
 * Dark Mode Testing Script
 * 
 * This script provides utilities for testing dark mode implementation
 * across the application. It includes functions for:
 * 
 * 1. Testing theme toggle functionality
 * 2. Checking contrast ratios for accessibility
 * 3. Verifying consistent styling across components
 */

// Utility to calculate contrast ratio between two colors
function calculateContrastRatio(foreground, background) {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Parse color strings to RGB
  const parseColor = (color) => {
    if (color.startsWith('#')) {
      return hexToRgb(color);
    } else if (color.startsWith('hsl')) {
      const match = color.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
      if (match) {
        return hslToRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
      }
    } else if (color.startsWith('rgb')) {
      const match = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      }
    }
    return null;
  };

  // Calculate relative luminance
  const calculateLuminance = (rgb) => {
    const sRGB = {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255
    };
    
    const rgb2 = {
      r: sRGB.r <= 0.03928 ? sRGB.r / 12.92 : Math.pow((sRGB.r + 0.055) / 1.055, 2.4),
      g: sRGB.g <= 0.03928 ? sRGB.g / 12.92 : Math.pow((sRGB.g + 0.055) / 1.055, 2.4),
      b: sRGB.b <= 0.03928 ? sRGB.b / 12.92 : Math.pow((sRGB.b + 0.055) / 1.055, 2.4)
    };
    
    return 0.2126 * rgb2.r + 0.7152 * rgb2.g + 0.0722 * rgb2.b;
  };

  // Parse colors
  const fgRGB = parseColor(foreground);
  const bgRGB = parseColor(background);
  
  if (!fgRGB || !bgRGB) {
    return null; // Invalid color format
  }
  
  // Calculate luminance
  const fgLuminance = calculateLuminance(fgRGB);
  const bgLuminance = calculateLuminance(bgRGB);
  
  // Calculate contrast ratio
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Test theme toggle functionality
function testThemeToggle() {
  console.log('Testing theme toggle functionality...');
  
  // Check if theme context is properly initialized
  const themeContext = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  console.log(`Initial theme: ${themeContext}`);
  
  // Find theme toggle button
  const themeToggleButton = document.querySelector('button[aria-label*="Switch to"]');
  
  if (!themeToggleButton) {
    console.error('Theme toggle button not found');
    return false;
  }
  
  // Test toggle functionality
  console.log('Clicking theme toggle button...');
  themeToggleButton.click();
  
  // Check if theme was toggled
  const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  console.log(`Theme after toggle: ${newTheme}`);
  
  const toggleWorked = themeContext !== newTheme;
  console.log(`Theme toggle ${toggleWorked ? 'works correctly' : 'failed'}`);
  
  // Toggle back to original theme
  themeToggleButton.click();
  const finalTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  console.log(`Theme restored to: ${finalTheme}`);
  
  return toggleWorked;
}

// Test contrast ratios for accessibility
function testContrastRatios() {
  console.log('Testing contrast ratios for accessibility...');
  
  const results = {
    pass: [],
    fail: [],
    warning: []
  };
  
  // Helper function to get computed style
  const getComputedColor = (element, property) => {
    return window.getComputedStyle(element).getPropertyValue(property);
  };
  
  // Test a specific element's contrast
  const testElementContrast = (element, description) => {
    const foreground = getComputedColor(element, 'color');
    const background = getComputedColor(element, 'background-color');
    
    const ratio = calculateContrastRatio(foreground, background);
    
    const result = {
      element: description,
      foreground,
      background,
      ratio: ratio ? ratio.toFixed(2) : 'Unknown'
    };
    
    if (ratio) {
      if (ratio >= 4.5) {
        result.status = 'PASS';
        results.pass.push(result);
      } else if (ratio >= 3) {
        result.status = 'WARNING';
        results.warning.push(result);
      } else {
        result.status = 'FAIL';
        results.fail.push(result);
      }
    } else {
      result.status = 'UNKNOWN';
      results.warning.push(result);
    }
    
    return result;
  };
  
  // Test key components
  const componentsToTest = [
    { selector: 'header', description: 'Header' },
    { selector: 'footer', description: 'Footer' },
    { selector: 'button', description: 'Button' },
    { selector: '.card', description: 'Card' },
    { selector: 'input', description: 'Input' },
    { selector: 'a', description: 'Link' },
    { selector: 'h1', description: 'Heading 1' },
    { selector: 'h2', description: 'Heading 2' },
    { selector: 'p', description: 'Paragraph' },
    { selector: 'section', description: 'Section' }
  ];
  
  componentsToTest.forEach(component => {
    const elements = document.querySelectorAll(component.selector);
    if (elements.length > 0) {
      // Test first instance of each component type
      const result = testElementContrast(elements[0], component.description);
      console.log(`${component.description}: ${result.status} - Contrast ratio: ${result.ratio}`);
    } else {
      console.log(`${component.description}: Not found in the document`);
    }
  });
  
  // Summary
  console.log('\nContrast Test Summary:');
  console.log(`PASS: ${results.pass.length}`);
  console.log(`WARNING: ${results.warning.length}`);
  console.log(`FAIL: ${results.fail.length}`);
  
  return results;
}

// Test consistency of dark mode styling
function testDarkModeConsistency() {
  console.log('Testing dark mode styling consistency...');
  
  // Ensure we're in dark mode for testing
  const isDarkMode = document.documentElement.classList.contains('dark');
  if (!isDarkMode) {
    console.log('Switching to dark mode for testing...');
    const themeToggleButton = document.querySelector('button[aria-label*="Switch to"]');
    if (themeToggleButton) {
      themeToggleButton.click();
    } else {
      console.error('Could not switch to dark mode - toggle button not found');
      return false;
    }
  }
  
  const results = {
    consistent: true,
    issues: []
  };
  
  // Check for consistent background colors
  const checkBackgroundConsistency = () => {
    const surfaces = Array.from(document.querySelectorAll('.surface-primary, .surface-secondary, .surface-tertiary'));
    const panels = Array.from(document.querySelectorAll('.panel-bg, .card'));
    
    // Check surface consistency
    const surfaceColors = surfaces.map(el => window.getComputedStyle(el).backgroundColor);
    const uniqueSurfaceColors = new Set(surfaceColors);
    
    if (uniqueSurfaceColors.size > 3) {
      results.consistent = false;
      results.issues.push(`Inconsistent surface colors: ${uniqueSurfaceColors.size} different colors found`);
    }
    
    // Check panel consistency
    const panelColors = panels.map(el => window.getComputedStyle(el).backgroundColor);
    const uniquePanelColors = new Set(panelColors);
    
    if (uniquePanelColors.size > 2) {
      results.consistent = false;
      results.issues.push(`Inconsistent panel colors: ${uniquePanelColors.size} different colors found`);
    }
  };
  
  // Check for consistent text colors
  const checkTextConsistency = () => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const paragraphs = Array.from(document.querySelectorAll('p'));
    
    // Check heading consistency
    const headingColors = headings.map(el => window.getComputedStyle(el).color);
    const uniqueHeadingColors = new Set(headingColors);
    
    if (uniqueHeadingColors.size > 2) {
      results.consistent = false;
      results.issues.push(`Inconsistent heading colors: ${uniqueHeadingColors.size} different colors found`);
    }
    
    // Check paragraph consistency
    const paragraphColors = paragraphs.map(el => window.getComputedStyle(el).color);
    const uniqueParagraphColors = new Set(paragraphColors);
    
    if (uniqueParagraphColors.size > 2) {
      results.consistent = false;
      results.issues.push(`Inconsistent paragraph colors: ${uniqueParagraphColors.size} different colors found`);
    }
  };
  
  // Check for consistent border colors
  const checkBorderConsistency = () => {
    const borders = Array.from(document.querySelectorAll('[class*="border"]'));
    
    // Check border consistency
    const borderColors = borders.map(el => window.getComputedStyle(el).borderColor).filter(color => color !== 'transparent');
    const uniqueBorderColors = new Set(borderColors);
    
    if (uniqueBorderColors.size > 3) {
      results.consistent = false;
      results.issues.push(`Inconsistent border colors: ${uniqueBorderColors.size} different colors found`);
    }
  };
  
  // Run consistency checks
  checkBackgroundConsistency();
  checkTextConsistency();
  checkBorderConsistency();
  
  // Report results
  if (results.consistent) {
    console.log('Dark mode styling is consistent across components');
  } else {
    console.log('Dark mode styling inconsistencies found:');
    results.issues.forEach(issue => console.log(`- ${issue}`));
  }
  
  // Return to original theme if needed
  if (!isDarkMode) {
    console.log('Switching back to light mode...');
    const themeToggleButton = document.querySelector('button[aria-label*="Switch to"]');
    if (themeToggleButton) {
      themeToggleButton.click();
    }
  }
  
  return results;
}

// Main test function
function runDarkModeTests() {
  console.log('=== DARK MODE TESTING ===');
  
  // Test theme toggle
  const toggleResult = testThemeToggle();
  console.log(`\nTheme toggle test: ${toggleResult ? 'PASSED' : 'FAILED'}`);
  
  // Test contrast ratios
  const contrastResults = testContrastRatios();
  console.log(`\nContrast ratio test: ${contrastResults.fail.length === 0 ? 'PASSED' : 'FAILED'}`);
  
  // Test consistency
  const consistencyResults = testDarkModeConsistency();
  console.log(`\nConsistency test: ${consistencyResults.consistent ? 'PASSED' : 'FAILED'}`);
  
  // Overall result
  const overallPass = toggleResult && contrastResults.fail.length === 0 && consistencyResults.consistent;
  console.log(`\nOverall dark mode test: ${overallPass ? 'PASSED' : 'FAILED'}`);
  
  return {
    toggleResult,
    contrastResults,
    consistencyResults,
    overallPass
  };
}

// Export test functions
if (typeof module !== 'undefined') {
  module.exports = {
    calculateContrastRatio,
    testThemeToggle,
    testContrastRatios,
    testDarkModeConsistency,
    runDarkModeTests
  };
}