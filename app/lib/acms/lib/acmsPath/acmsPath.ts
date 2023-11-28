import { encodeUri } from '../../../../utils';
import { AcmsContext } from './types';

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export default function acmsPath(acmsContext: AcmsContext = {}) {
  let path = [
    'blog',
    'category',
    'entry',
    'keyword',
    'tag',
    'order',
    'page',
    'limit',
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

    if (Array.isArray(value)) {
      return value.length > 0
        ? `${path}/${key}/${value.map(encodeUri).join('/')}`
        : path;
    }

    if (key === 'page' && value === 1) {
      return path;
    }

    return `${path}/${key}/${encodeUri(value as string | number)}`;
  }, '');

  if (acmsContext.searchParams && acmsContext.searchParams.size > 0) {
    path += `/?${acmsContext.searchParams}`;
  }

  return path;
}
