import type { Blog } from '.';
import type { CategoryStatus } from './enums';

export type Category = {
  id: number;
  code: string;
  status: CategoryStatus;
  sort: number;
  name: string;
  pcid: number;
  indexing: 'on' | 'off';
  path: string;
  blog: Blog;
};
