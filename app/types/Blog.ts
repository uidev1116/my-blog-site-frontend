import type { BlogStatus } from './enums';

export type Blog = {
  id: number;
  code: string;
  status: BlogStatus;
  sort: number;
  name: string;
  pbid: number;
  indexing: 'on' | 'off';
  path: string;
  createdAt: Date;
};
