export type Blog = {
  id: number;
  code: string;
  name: string;
  path: string;
};

export type RootBlog = Blog & {
  twitterAccount?: string;
  googleAnalytics?: string;
  googleSiteVerification?: string;
  gaId: string;
  scriptHead: string;
  scriptBodyStart: string;
  scriptBodyEnd: string;
  noIndex: boolean;
};

export type BlogBlog = Blog & {
  ogpImageBasePath?: string;
};
