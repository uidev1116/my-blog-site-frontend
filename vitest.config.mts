import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname) },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // 実行環境の値に依存させないための既定値。個別のテストは vi.stubEnv で上書きできる
    env: {
      NEXT_PUBLIC_BASE_URL: 'https://example.com',
      ACMS_API_PROTOCOL: 'https',
      ACMS_API_HOSTNAME: 'cms.example.com',
      ACMS_API_PORT: '',
      ACMS_API_KEY: 'test-api-key',
      ACMS_API_PREVIEW_KEY: 'test-preview-key',
      ACMS_ASSETS_PROTOCOL: 'https',
      ACMS_ASSETS_HOSTNAME: 'assets.example.com',
      ACMS_ASSETS_PORT: '',
    },
    include: ['**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text', 'html', 'lcov'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        // テスト用ヘルパー
        'app/test-utils/**',
        // 型定義のみ
        'app/types/**',
        // re-export のみの barrel ファイル
        '**/index.{ts,tsx}',
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
});
