import { describe, expect, it, vi } from 'vitest';

// app/config が、サイトの URL を import 時に読む
vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');

describe('/blog/preview/ のメタデータ', () => {
  it('検索エンジンに載せない(noindex, nofollow)', async () => {
    const { metadata } = await import('./page');

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
