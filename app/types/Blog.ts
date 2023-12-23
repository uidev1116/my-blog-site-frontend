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

export type RootBlog = Blog & {
  twitterAccount?: string;
  facebookAccount?: string;
  githubAccount?: string;
  youtubeAccount?: string;
  googleAnalytics?: string;
  googleSiteVerification?: string;
  gaId: string;
};

export type BlogBlog = Blog & {
  ogpImageBasePath?: string;
};
