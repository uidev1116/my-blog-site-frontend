import type { Blog, Category, Tag, User, Unit, BlogBlog } from '.';
import type { EntryStatus } from './enums';

export type Entry = {
  id: number;
  code: string;
  sort: number;
  csort: number;
  usort: number;
  status: EntryStatus;
  title: string;
  path: string;
  isNew: boolean;
  createdAt: Date;
  updatedAt?: Date;
  postedAt?: Date;
  startAt?: Date;
  endAt?: Date;
  summary?: string;
  tags?: Tag[];
  category?: Category;
  blog?: Blog;
  user?: User;
  units?: Unit[];
};

export type BlogEntry = Entry & {
  blog?: BlogBlog;
};
