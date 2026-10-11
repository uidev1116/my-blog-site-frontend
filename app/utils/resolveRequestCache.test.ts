import { afterEach, describe, expect, it, vi } from 'vitest';
import resolveRequestCache from './resolveRequestCache';

describe('resolveRequestCache', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('開発時は指定に関わらず no-cache', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(resolveRequestCache('force-cache')).toBe('no-cache');
  });

  it('本番では指定をそのまま返す', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(resolveRequestCache('force-cache')).toBe('force-cache');
    expect(resolveRequestCache()).toBeUndefined();
  });
});
