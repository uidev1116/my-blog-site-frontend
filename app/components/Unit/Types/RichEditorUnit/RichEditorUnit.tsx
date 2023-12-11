import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  attributesToProps,
  DOMNode,
} from 'html-react-parser';
import type { Unit, RichEditorUnit } from '@/app/types';
import Link from 'next/link';
import { ASSETS_HOST } from '@/app/config/acms';

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

      if (domNode.tagName === 'img') {
        const { src, alt, ...rest } = domNode.attribs;
        const url = new URL(src, ASSETS_HOST);
        return (
          <a href={url.toString()} className="js-smartphoto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url.toString()} alt={alt} {...attributesToProps(rest)} />
          </a>
        );
      }
    }
  },
};

export default function RichEditorUnit({ html }: Unit<RichEditorUnit>) {
  return <div>{parse(html, options)}</div>;
}
