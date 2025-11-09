'use client';

import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  attributesToProps,
  DOMNode,
} from 'html-react-parser';
import Link from 'next/link';
import Image from 'next/image';
import { ASSETS_HOST } from '@/app/config/acms';

type Props = { html: string };

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
        return <Image src={src} alt={alt} {...attributesToProps(rest)} />;
      }
    }
  },
};

export default function EntryBody({ html }: Props) {
  return <>{parse(html, options)}</>;
}
