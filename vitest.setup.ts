import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// globals を有効にしていないため、Testing Library の自動クリーンアップが働かない
afterEach(() => {
  cleanup();
});
