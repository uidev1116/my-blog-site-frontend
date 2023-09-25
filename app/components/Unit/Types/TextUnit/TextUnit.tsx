import nl2br from 'react-nl2br';
import ReactMarkdown from 'react-markdown';
import type { Unit, TextUnit } from '@/app/types';

function getClassName(attr: string) {
  // class="〇〇"を取り出す。
  return attr.trim().substring(6, attr.trim().length - 1);
}

function line2List(string: string): React.ReactElement[] {
  return string
    .split(/( |　|\t)*\r?\n/)
    .filter((v) => !!v)
    .map((line, index) => {
      return <li key={index}>{line}</li>;
    });
}

export default function TextUnit({
  attr,
  tag,
  text,
  extendTag,
}: Unit<TextUnit>) {
  if (tag === 'p') {
    return (
      <p
        id={extendTag || undefined}
        className={getClassName(attr) || undefined}
        dangerouslySetInnerHTML={{ __html: nl2br(text) }}
      />
    );
  } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
    const Heading = tag as Extract<
      typeof tag,
      'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    >;
    return (
      <Heading
        id={extendTag || undefined}
        className={getClassName(attr) || undefined}
        dangerouslySetInnerHTML={{ __html: nl2br(text) }}
      />
    );
  } else if (['ul', 'ol'].includes(tag)) {
    const List = tag as Extract<typeof tag, 'ol' | 'ul'>;
    return (
      <List className={getClassName(attr) || undefined}>{line2List(text)}</List>
    );
  } else if (tag === 'blockquote') {
    return (
      <blockquote className={getClassName(attr) || undefined}>
        <p dangerouslySetInnerHTML={{ __html: nl2br(text) }} />
      </blockquote>
    );
  } else if (tag === 'pre') {
    return (
      <pre className="line-numbers">
        <code className={getClassName(attr) || undefined}>{text}</code>
      </pre>
    );
  } else if (tag === 'none') {
    return text;
  } else if (tag === 'markdown') {
    return <ReactMarkdown>{text}</ReactMarkdown>;
  } else if (tag === 'wysiwyg') {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }

  return <p dangerouslySetInnerHTML={{ __html: nl2br(text) }} />;
}
