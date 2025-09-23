# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (runs on port 3000 with UTC timezone)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run test` - Run tests (Note: Vitest dependency needs to be installed)

### Code Quality
- ESLint configuration includes Next.js core web vitals, JSX a11y, and Prettier
- Use `npm run lint` before committing changes
- TypeScript strict mode is enabled
- Husky pre-commit hooks are configured

### Node.js Version
- Project uses Node.js 22.19.0 (managed via Volta)

## Architecture Overview

### Framework & Technology Stack
- **Next.js 14** with App Router (app directory structure)
- **TypeScript** with strict mode
- **Tailwind CSS** for styling with Flowbite components
- **ACMS SDK** (`@uidev1116/acms-js-sdk`) for CMS integration
- **SWR** for data fetching and caching

### Project Structure

#### Core Directories
- `app/` - Next.js App Router pages and components (primary structure)
- `app/components/` - Reusable React components with index.ts barrel exports
- `app/types/` - TypeScript type definitions organized by domain
- `app/lib/` - Library integrations (ACMS client, build-in scripts, fonts)
- `app/utils/` - Utility functions
- `app/hooks/` - Custom React hooks
- `app/stores/` - React Context providers (currently color theme management)

#### Key Components Architecture
- **Unit System**: Flexible content unit system in `app/components/Unit/Types/` supporting various content types (Text, Media, Table, OpenStreetMap, RichEditor)
- **Card Components**: Composable card system with Header, Body, Footer
- **Layout Components**: Header, Footer, Container with navigation integration
- **Theme System**: Dark/light mode with localStorage persistence and system preference detection

### Data Layer

#### ACMS Integration
- Central API client in `app/lib/acms/index.ts`
- Main API functions in `app/api/index.ts`:
  - `getBlogEntries()` - Fetch blog post listings
  - `getGlobalNavigation()` / `getFooterNavigation()` - Navigation data
  - `getRootBlog()` - Site configuration
  - `getOgp()` / `getMetadata()` - SEO metadata generation
- Request caching via `resolveRequestCache()` utility

#### Environment Configuration
- `DOMAIN` - Site domain for base URL generation
- `ACMS_ASSETS_HOST` - Asset hosting configuration
- `API_HOST` / `API_KEY` - ACMS API configuration

### Routing Structure
- Blog listing: `/blog` with pagination `/blog/page/[page]`
- Individual posts: `/blog/[code]`
- Tag filtering: `/blog/tag/[tag]` with pagination
- Search: `/blog/search` with pagination
- Zenn articles: `/blog/zenn` with pagination
- Profile: `/profile`

### Content Management
- **Unit-based Content**: Content is structured using a flexible unit system supporting various types (text, media, tables, maps)
- **Type Safety**: Comprehensive TypeScript types for all content structures
- **SEO**: Automated metadata generation with OpenGraph and Twitter Card support

### Styling Approach
- **Tailwind CSS** with custom configuration
- **Flowbite** component library integration
- **Dark Mode**: System-wide theme switching with persistence
- **Responsive Design**: Mobile-first approach

### Third-Party Integrations
- **Maps**: Leaflet for OpenStreetMap integration
- **Photo Galleries**: SmartPhoto for image viewing
- **Progress Indicators**: NProgress for page transitions
- **Analytics**: Google Analytics integration via Next.js third-parties
- **RSS Feeds**: Feed generation capabilities

### Development Practices
- **Component Organization**: Each component has its own directory with index.ts for clean imports
- **Type Organization**: Types organized by domain in separate files
- **Path Aliases**: `@/*` maps to project root for clean imports
- **Code Splitting**: Automatic with Next.js App Router

## Important Notes

### CMS Integration
This project integrates heavily with ACMS (A-CMS) headless CMS. All content fetching goes through the ACMS SDK client configured in `app/lib/acms/index.ts`.

### Time Zone Handling
Development server runs in UTC timezone (`TZ='Etc/UTC'`) - ensure consistency when working with dates.

### Build Configuration
- Next.js configured with trailing slashes and specific image remote patterns
- TypeScript with bundler module resolution
- Automatic font optimization via `next/font`

### State Management
Currently uses React Context for theme management. SWR handles server state caching.