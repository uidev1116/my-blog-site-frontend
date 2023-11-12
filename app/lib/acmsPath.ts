import { encodeUri } from '../utils';
import type { AcmsContext } from '../types';

export default function acmsPath(acmsContext: AcmsContext = {}) {
  let path = ['keyword', 'tag', 'order', 'page', 'api'].reduce((path, key) => {
    const value = acmsContext[key as keyof AcmsContext];
    if (value === undefined || value === null) {
      return path;
    }

    if (Array.isArray(value)) {
      return value.length > 0
        ? `${path}/${key}/${value.map(encodeUri).join('/')}`
        : path;
    }

    return `${path}/${key}/${encodeUri(value as string | number)}`;
  }, '');

  if (acmsContext.query) {
    const searchParams = new URLSearchParams();
    Object.entries(acmsContext.query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.append(key, value as string);
      }
    });
    path += `/?${searchParams.toString()}`;
  }

  return path;
}
