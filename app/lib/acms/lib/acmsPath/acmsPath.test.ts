import { describe, expect, test } from 'vitest';
import { acmsPath } from '.';

describe('blog', () => {
  test('work with blog context', () => {
    expect(acmsPath({ blog: 'blog' })).toBe('blog');
    expect(acmsPath({ blog: 1 })).toBe('bid/1');
  });
});

describe('category', () => {
  test('work with category context', () => {
    expect(acmsPath({ category: 'category' })).toBe('category');
    expect(acmsPath({ category: ['hoge', 'fuga'] })).toBe('hoge/fuga');
    expect(acmsPath({ blog: 1, category: 2 })).toBe('bid/1/cid/2');
  });
});

describe('entry', () => {
  test('work with entry context', () => {
    expect(acmsPath({ entry: 'entry-1.html' })).toBe('entry-1.html');
    expect(acmsPath({ entry: 3 })).toBe('eid/3');
  });
});

describe('uid', () => {
  test('work with uid context', () => {
    expect(acmsPath({ uid: 1 })).toBe('uid/1');
  });
});

describe('keyword', () => {
  test('work with keyword context', () => {
    expect(
      acmsPath({ blog: 'blog', category: 'category', keyword: 'keyword' }),
    ).toBe('blog/category/keyword/keyword');
  });
});

describe('tag', () => {
  test('work with tag context', () => {
    expect(
      acmsPath({ blog: 'blog', category: 'category', tag: ['apple', 'grape'] }),
    ).toBe('blog/category/tag/apple/grape');
  });
});

describe('span', () => {
  test('work with span context', () => {
    expect(
      acmsPath({
        blog: 'blog',
        category: 'category',
        span: { start: '2014-01-01 00:00:00', end: '2015-12-31 23:59:59' },
      }),
    ).toBe(
      'blog/category/2014-01-01%2000%3A00%3A00/-/2015-12-31%2023%3A59%3A59',
    );
    expect(
      acmsPath({
        blog: 'blog',
        category: 'category',
        span: { start: '2014-01-01 00:00:00' },
      }),
    ).toBe(
      'blog/category/2014-01-01%2000%3A00%3A00/-/9999-12-31%2023%3A59%3A59',
    );
    expect(
      acmsPath({
        blog: 'blog',
        category: 'category',
        span: { end: '2015-12-31 23:59:59' },
      }),
    ).toBe(
      'blog/category/1000-01-01%2000%3A00%3A00/-/2015-12-31%2023%3A59%3A59',
    );
  });

  test('throw error with invalid span context', () => {
    expect(() =>
      acmsPath({
        blog: 'blog',
        category: 'category',
        span: { start: 'invalid date' },
      }),
    ).toThrow('Invalid start date: invalid date');
    expect(() =>
      acmsPath({
        blog: 'blog',
        category: 'category',
        span: { end: 'invalid date' },
      }),
    ).toThrow('Invalid end date: invalid date');
  });
});

describe('date', () => {
  test('work with date context', () => {
    expect(acmsPath({ blog: 'blog', category: 'category', date: [2015] })).toBe(
      'blog/category/2015',
    );
    expect(
      acmsPath({ blog: 'blog', category: 'category', date: [2015, 12] }),
    ).toBe('blog/category/2015/12');
    expect(
      acmsPath({ blog: 'blog', category: 'category', date: [2015, 12, 19] }),
    ).toBe('blog/category/2015/12/19');
  });
});

describe('field', () => {
  test('work with field context', () => {
    expect(
      acmsPath({
        blog: 'blog',
        category: 'category',
        field: 'price/gte/1000/_and_/color/red',
      }),
    ).toBe('blog/category/field/price/gte/1000/_and_/color/red');
  });
});

describe('order', () => {
  test('work with order context', () => {
    expect(acmsPath({ blog: 'blog', order: 'id-asc' })).toBe(
      'blog/order/id-asc',
    );
  });
});

describe('page', () => {
  test('work with page context', () => {
    expect(acmsPath({ blog: 'blog', category: 'category', page: 1 })).toBe(
      'blog/category',
    );
    expect(acmsPath({ blog: 'blog', category: 'category', page: 2 })).toBe(
      'blog/category/page/2',
    );
  });
});

describe('limit', () => {
  test('work with limit context', () => {
    expect(acmsPath({ blog: 'blog', category: 'category', limit: 100 })).toBe(
      'blog/category/limit/100',
    );
  });
});

describe('tpl', () => {
  test('work with tpl context', () => {
    expect(
      acmsPath({
        blog: 'blog',
        category: 'category',
        tpl: 'include/sample.json',
      }),
    ).toBe('blog/category/tpl/include%2Fsample.json');
  });
});

describe('api', () => {
  test('work with api context', () => {
    expect(acmsPath({ blog: 'blog', api: 'summary_index' })).toBe(
      'blog/api/summary_index',
    );
  });
});

describe('searchParams', () => {
  test('work with searchParams context', () => {
    expect(
      acmsPath({
        searchParams: new URLSearchParams({ keyword: 'a-blog cms' }),
      }),
    ).toBe('?keyword=a-blog+cms');
    expect(acmsPath({ searchParams: { foo: '1', bar: '2' } })).toBe(
      '?foo=1&bar=2',
    );
    expect(
      acmsPath({
        searchParams: [
          ['foo', '1'],
          ['bar', '2'],
        ],
      }),
    ).toBe('?foo=1&bar=2');
  });
});
