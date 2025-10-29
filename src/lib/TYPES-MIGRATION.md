# Types Migration Plan

## Overview

This document outlines the plan (2025-02) to migrate from the legacy monolithic `types.ts` file to the new organized type system in the `/types` directory structure. This migration will:

1. Reduce complexity
2. Eliminate duplicate type definitions
3. Prevent circular dependencies
4. Improve code maintainability

## Current Structure

Types are currently defined in:

- `/src/lib/types.ts` (legacy, deprecated file)
- `/src/lib/types/*.ts` (new, organized structure)

## Migration Process

### Phase 1: Preparation (Current)

- ✅ Add deprecation notice to `/src/lib/types.ts`
- ✅ Ensure all new types are added to the appropriate file in `/types`

### Phase 2: Gradual Migration

1. For each component importing from `@/lib/types`:
   - Update imports to point to specific type files
   - Example: `import { Module } from '@/lib/types'` → `import { Module } from '@/lib/types/moduleTypes'`

2. Use search tools to find all imports from `/lib/types`:
   ```
   grep -r "from '@/lib/types'" src
   ```

3. For each file found:
   - Identify which specific types are needed
   - Replace with imports from the appropriate `/types/*.ts` file

### Phase 3: Deprecation

1. Once all direct imports from `/lib/types.ts` have been updated:
   - Keep the `types.ts` file temporarily for backward compatibility
   - Make sure it only re-exports types from the new location
   - Add prominent warnings that it will be removed

### Phase 4: Removal

1. When confident all imports have been updated:
   - Remove the `/lib/types.ts` file
   - Run tests to ensure nothing breaks
   - Deploy and monitor for any issues

## Key Type Files

- `baseTypes.ts`: Environment variables and core type re-exports
- `wpTypes.ts`: WordPress API response types
- `moduleTypes.ts`: Module-related types
- `componentTypes.ts`: React component props
- `contentTypes.ts`: Content-related types (Post, Page, etc.) including the BaseContent interface
- `formTypes.ts`: Form-related types
- `hookTypes.ts`: Hook-related type definitions

## Environment Variables

- All environment variable types are now defined in `baseTypes.ts`
- Sensitive data comes from .env.local. Always ask for it if in doubt.
- Added `NEXT_PUBLIC_ENABLE_DEBUG` for controlling debug output

## Type Consolidation

- BaseContent is now defined only in `contentTypes.ts` and re-exported from `baseTypes.ts` for backward compatibility
- Removed duplicate definitions to prevent inconsistencies
- Type exports use the proper `export type` syntax for TypeScript's isolatedModules mode

## WordPress Types Consolidation

- Consolidated WordPress-related types from `types-wordpress.ts` into `wpTypes.ts`
- Added deprecation notice to `types-wordpress.ts`
- Added import for `Module` from `moduleTypes.ts` to ensure proper typing of WordPress Page modules
- Updated `LocalPage` interface to extend `WordPressPage` for cleaner type inheritance

## Hook Types Consolidation

- Created new `hookTypes.ts` file to centralize hook-related type definitions
- Moved the `DebugMode` interface from `useDebugMode.ts` to `hookTypes.ts`
- Updated `useDebugMode.ts` to import the interface from the new location

## Benefits

- Single source of truth for each type
- Clear file organization based on domain
- Reduced risk of circular dependencies
- Easier to locate and modify types
- Better editor support (auto-imports will work correctly)
