import { format } from 'date-fns';
import { encodeUri, isDateString, isNumber, isString } from '../../../../utils';
import { AcmsContext } from './types';

export default function acmsPath(acmsContext: AcmsContext = {}) {
  let path = [
    'blog',
    'category',
    'entry',
    'uid',
    'tag',
    'field',
    'span',
    'date',
    'page',
    'order',
    'limit',
    'keyword',
    'tpl',
    'api',
  ].reduce((path, key) => {
    const value = acmsContext[key as keyof AcmsContext];
    if (value === undefined || value === null) {
      return path;
    }

    if (key === 'blog') {
      if (isNumber(value)) {
        return `${path}/bid/${value}`;
      }
      return `${path}/${(value as string).split('/').map(encodeUri).join('/')}`;
    }

    if (key === 'category') {
      if (isNumber(value)) {
        return `${path}/cid/${value}`;
      }
      if (Array.isArray(value)) {
        return `${path}/${value.map(encodeUri).join('/')}`;
      }
      return `${path}/${encodeUri(value as string)}`;
    }

    if (key === 'entry') {
      if (isNumber(value)) {
        return `${path}/eid/${value}`;
      }
      return `${path}/${encodeUri(value as string)}`;
    }

    if (key === 'field') {
      return `${path}/field/${(value as string)
        .split('/')
        .map(encodeUri)
        .join('/')}`;
    }

    if (key === 'span') {
      let { start, end } = {
        ...{ start: '1000-01-01 00:00:00', end: '9999-12-31 23:59:59' },
        ...(value as AcmsContext['span']),
      };
      if (isString(start) && isDateString(start) === false) {
        throw new Error(`Invalid start date: ${start}`);
      }
      if (isString(end) && isDateString(end) === false) {
        throw new Error(`Invalid end date: ${end}`);
      }
      return `${path}/${encodeUri(
        format(new Date(start), 'yyyy-MM-dd HH:mm:ss'),
      )}/-/${encodeUri(format(new Date(end), 'yyyy-MM-dd HH:mm:ss'))}`;
    }

    if (key === 'date') {
      if (acmsContext.span != null) {
        return path;
      }
      return `${path}/${(value as Required<AcmsContext>['date']).join('/')}`;
    }

    if (key === 'page') {
      return value === 1 ? path : `${path}/page/${value}`;
    }

    if (Array.isArray(value)) {
      return value.length > 0
        ? `${path}/${key}/${value.map(encodeUri).join('/')}`
        : path;
    }

    return `${path}/${key}/${encodeUri(value as string | number)}`;
  }, '');

  const searchParams = new URLSearchParams(acmsContext.searchParams);
  if (searchParams.size > 0) {
    path += `/?${searchParams}`;
  }

  // 相対パスでの指定ができるように先頭のスラッシュを削除する
  // ex: new URL(acmsPath({ blog: 'blog' }), 'https://example.com/hoge/') => https://example.com/hoge/blog
  return path.startsWith('/') ? path.slice(1) : path;
}
