import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// globals を有効にしていないため、Testing Library の自動クリーンアップが効かない。
// テストごとに描画した DOM を片付ける(DOM のないテストでは何もしない)
afterEach(() => {
  cleanup();
});
