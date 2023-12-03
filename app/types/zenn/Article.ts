import { ZennUser } from '.';

export type ZennArticle = {
  id: number;
  postType: 'Article';
  title: string;
  slug: string;
  articleType: 'tech' | 'idea';
  emoji: string;
  publishedAt: Date;
  url: string;
};
