# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Preference

**IMPORTANT: Always respond in Japanese (日本語) for all interactions in this project.**

## Development Commands

### Essential Commands

- `npm run dev` - Start development server (runs on port 3000 with UTC timezone)
- `npm run build` - Build production application
- `npm run lint` - Run ESLint checks
- `npm run test` - Run tests with Vitest (TDD で進める方針。テストは実装の隣に置く。詳細は `docs/testing.md`)
- `npm run test:coverage` - Run tests with coverage (lines / statements / functions / branches すべて 90% 以上が閾値。CI でも実行される)
- `npm run build` - 静的書き出し(`out/`)。`npm run preview` / `npm run deploy` は Cloudflare 用。詳細は `docs/cloudflare-workers.md`

### Code Quality

- ESLint configuration includes Next.js core web vitals, JSX a11y, and Prettier
- Use `npm run lint` before committing changes
- TypeScript strict mode is enabled
- Husky pre-commit hooks are configured

### Node.js Version

- Project uses Node.js 24 LTS (24.21.0, managed via Volta; `engines.node` で Vercel にも 24.x を指定)

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
- `ACMS_ASSETS_HOSTNAME` - Asset hosting configuration
- `API_HOST` / `API_KEY` - ACMS API configuration

### Routing Structure

- Blog listing: `/blog` with pagination `/blog/page/[page]`
- Individual posts: `/blog/[code]`
- Tag filtering: `/blog/tag/[tag]` with pagination
- Search: `/blog/search/?keyword=...&page=N`(静的な土台 + ブラウザで Worker の API から取得)
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

## Testing

詳細は `docs/testing.md`。実装・修正時は次を守る。

- **TDD**: 新しい挙動や修正は、先に失敗するテストを書いてから実装する。バグ修正は、再現するテストを先に追加する。
- **コロケーション**: テストは実装の隣に置く(`Foo.tsx` → `Foo.test.tsx`)。`tests/` や `__tests__/` は作らない。
- **カバレッジ 90% 以上**を維持する(`npm run test:coverage`)。対象は `app/**`。型定義・barrel(`index.ts`)・`app/test-utils` は除外。
- **DOM が要るテスト**は、先頭に `// @vitest-environment jsdom` を書く(既定は node)。
- **コンポーネント**は Testing Library で、ユーザーから見える振る舞い(ロール・テキスト・操作)を検証する。内部 state やクラス名は見ない。
- **外部との境界**(ACMS クライアント、`fetch`、ブラウザ API)はモックする。`next/dynamic` と `next/link` は `app/test-utils/` の差し替えを使う。
- **async Server Component**(ページ・Header・Footer)は、関数として呼び出す。`render(await Header(props))` で描画を、返った要素の `props` で渡している値を検証する。ページは API とルートコンポーネントをモックする。
- **環境変数**の既定値は `vitest.config.mts` の `test.env`。変えたいテストだけ `vi.stubEnv` で上書きする。
- **テスト名**は、何が起きるべきかを日本語で書く。
- E2E(Playwright 等)は未導入。必要になったら専用ディレクトリで導入する。

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
