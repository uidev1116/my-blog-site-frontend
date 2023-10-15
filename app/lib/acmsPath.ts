import { encodeUri } from '../utils';
import type { AcmsContext } from '../types';

export default function acmsPath(acmsContext: AcmsContext = {}) {
  return ['keyword', 'tag', 'order', 'page'].reduce((path, key) => {
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
}
