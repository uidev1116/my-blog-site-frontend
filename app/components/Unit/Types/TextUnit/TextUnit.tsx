import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  attributesToProps,
  DOMNode,
} from 'html-react-parser';
import type { Unit, TextUnit } from '@/app/types';
import { nl2br } from '@/app/utils';
import Link from 'next/link';
import { highlight } from '@/app/lib/shiki';

const options: HTMLReactParserOptions = {
  replace(domNode) {
    if (domNode instanceof Element && domNode.attribs) {
      if (domNode.tagName === 'a') {
        const { href, ...rest } = domNode.attribs;
        return (
          <Link href={href} {...attributesToProps(rest)}>
            {domToReact(domNode.children as DOMNode[], options)}
          </Link>
        );
      }
    }
  },
};

function getClassName(attr: string) {
  // class="〇〇"を取り出す。
  return attr.trim().substring(6, attr.trim().length - 1) || undefined;
}

function line2List(string: string): React.ReactElement[] {
  return string
    .split(/( |　|\t)*\r?\n/)
    .filter((v) => !!v)
    .map((line, index) => {
      return <li key={index}>{line}</li>;
    });
}

export default async function TextUnit({
  attr,
  tag,
  text,
  extendTag,
}: Unit<TextUnit>) {
  if (tag === 'p') {
    return (
      <p id={extendTag || undefined} className={getClassName(attr)}>
        {parse(nl2br(text), options)}
      </p>
    );
  } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
    const Heading = tag as Extract<
      typeof tag,
      'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    >;
    return (
      <Heading id={extendTag || undefined} className={getClassName(attr)}>
        {parse(nl2br(text), options)}
      </Heading>
    );
  } else if (['ul', 'ol'].includes(tag)) {
    const List = tag as Extract<typeof tag, 'ol' | 'ul'>;
    return <List className={getClassName(attr)}>{line2List(text)}</List>;
  } else if (tag === 'blockquote') {
    return (
      <blockquote className={getClassName(attr)}>
        <p>{parse(nl2br(text), options)}</p>
      </blockquote>
    );
  } else if (tag === 'pre') {
    const html = await highlight(text, 'houston');
    return <>{parse(html)}</>;
  } else if (tag === 'none') {
    return <>{parse(text, options)}</>;
  } else if (tag === 'markdown') {
    return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown>;
  } else if (tag === 'wysiwyg') {
    return <>{parse(text, options)}</>;
  }

  return null;
}
