import { ZennArticle } from '@/app/types';
import Link from 'next/link';
import { Badge, Card, CardFooter, CardHeader } from '..';
import { format, formatISO9075 } from 'date-fns';

type Props = {
  articles: ZennArticle[];
  className?: string;
};

export default function ZennArticleList({
  articles = [],
  className = 'grid gap-4 md:grid-cols-2',
}: Props) {
  return (
    <ul className={className}>
      {articles.map((article) => (
        <li key={article.id}>
          <article className="h-full">
            <a href={article.url} target="_blank" rel="noreferrer noopener">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <time
                      dateTime={formatISO9075(article.publishedAt)}
                      className="text-sm font-light text-gray-600 dark:text-gray-400"
                    >
                      {format(article.publishedAt, 'yyyy/MM/dd')}
                    </time>
                  </div>
                  <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {article.title}
                  </h5>
                </CardHeader>
                <CardFooter>
                  <Badge>{article.articleType}</Badge>
                </CardFooter>
              </Card>
            </a>
          </article>
        </li>
      ))}
    </ul>
  );
}
