import type { Blog } from '.';
import type { UserAuth, UserStatus } from './enums';

export type User = {
  id: number;
  code: string;
  status: UserStatus;
  sort: number;
  name: string;
  mail: string;
  auth: UserAuth;
  indexing: 'on' | 'off';
  url: string;
  icon: string;
  largeIcon: string;
  createdAt: Date;
  updatedAt: Date;
  blog: Blog;
};
