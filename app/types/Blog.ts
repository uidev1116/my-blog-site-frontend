export type Blog = {
  id: number;
  code: string;
  name: string;
  path: string;
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
