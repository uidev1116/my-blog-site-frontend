import { expect, test } from 'vitest';
import { acmsPath } from '.';

test('work with blog context', () => {
  expect(acmsPath({ blog: 'blog' })).toBe('/blog');
  expect(acmsPath({ blog: 1 })).toBe('/bid/1');
});

test('work with category context', () => {
  expect(acmsPath({ category: 'category' })).toBe('/category');
  expect(acmsPath({ category: ['hoge', 'fuga'] })).toBe('/hoge/fuga');
  expect(acmsPath({ blog: 1, category: 2 })).toBe('/bid/1/cid/2');
});

test('work with entry context', () => {
  expect(acmsPath({ entry: 'entry-1.html' })).toBe('/entry-1.html');
  expect(acmsPath({ entry: 3 })).toBe('/eid/3');
});

test('work with keyword context', () => {
  expect(
    acmsPath({ blog: 'blog', category: 'category', keyword: 'keyword' }),
  ).toBe('/blog/category/keyword/keyword');
});

test('work with tag context', () => {
  expect(
    acmsPath({ blog: 'blog', category: 'category', tag: ['apple', 'grape'] }),
  ).toBe('/blog/category/tag/apple/grape');
});

test('work with order context', () => {
  expect(acmsPath({ blog: 'blog', order: 'id-asc' })).toBe(
    '/blog/order/id-asc',
  );
});

test('work with page context', () => {
  expect(acmsPath({ blog: 'blog', category: 'category', page: 1 })).toBe(
    '/blog/category',
  );
  expect(acmsPath({ blog: 'blog', category: 'category', page: 2 })).toBe(
    '/blog/category/page/2',
  );
});

test('work with limit context', () => {
  expect(acmsPath({ blog: 'blog', category: 'category', limit: 100 })).toBe(
    '/blog/category/limit/100',
  );
});

test('work with api context', () => {
  expect(acmsPath({ blog: 'blog', api: 'summary_index' })).toBe(
    '/blog/api/summary_index',
  );
});

test('work with searchParams context', () => {
  const searchParams = new URLSearchParams({ keyword: 'a-blog cms' });
  expect(acmsPath({ searchParams })).toBe('/?keyword=a-blog+cms');
});
