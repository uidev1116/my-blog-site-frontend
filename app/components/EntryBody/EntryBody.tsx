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
import { RichLink } from '../RichLink';
import { LightboxProvider, LightboxTrigger } from '../Lightbox';
import { Slide } from 'yet-another-react-lightbox';

interface Props {
  html: string;
}

function getText(node: DOMNode): string {
  if (node.type === 'text') {
    return (node as { data: string }).data;
  }
  if (node instanceof Element && node.children) {
    return node.children.map((child) => getText(child as DOMNode)).join('');
  }
  return '';
}

function findNode(
  node: DOMNode,
  predicate: (node: DOMNode) => boolean,
): DOMNode | undefined {
  if (predicate(node)) return node;
  if (node instanceof Element && node.children) {
    for (const child of node.children) {
      const found = findNode(child as DOMNode, predicate);
      if (found) return found;
    }
  }
  return undefined;
}

function isConfiguredHost(src: string): boolean {
  if (src === '') {
    return false;
  }
  if (ASSETS_HOST === '') {
    return false;
  }
  try {
    // Extract hostname from src URL
    const srcUrl = src.startsWith('http')
      ? new URL(src)
      : new URL(src, 'https://' + ASSETS_HOST);
    const { hostname, port } = srcUrl;
    const host = port ? `${hostname}:${port}` : hostname;
    // Compare with configured host (remove protocol if present)
    const configuredHost = ASSETS_HOST.replace(/^https?:\/\//, '').replace(
      /\/$/,
      '',
    );

    return host === configuredHost || host.endsWith('.' + configuredHost);
  } catch {
    // If URL parsing fails, fallback to string comparison
    return (
      src.startsWith(ASSETS_HOST) ||
      src.startsWith(`https://${ASSETS_HOST}`) ||
      src.startsWith(`http://${ASSETS_HOST}`)
    );
  }
}

export default function EntryBody({ html }: Props) {
  const slides: Slide[] = [];

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (domNode instanceof Element && domNode.attribs) {
        if (domNode.tagName === 'a') {
          const { href, ...rest } = domNode.attribs;

          // Check if anchor contains an image
          const imgNode = findNode(
            domNode,
            (n) => n instanceof Element && n.tagName === 'img',
          ) as Element | undefined;

          if (imgNode) {
            const {
              src,
              alt = '',
              width,
              height,
              ...imgRest
            } = imgNode.attribs;

            if (isConfiguredHost(src)) {
              const fill = width === '' || height === '';
              const w = width !== '' ? parseInt(width, 10) : undefined;
              const h = height !== '' ? parseInt(height, 10) : undefined;

              slides.push({
                src,
                width: w,
                height: h,
                alt,
              });
              const index = slides.length - 1;

              // Replace the anchor with LightboxTrigger (button), preventing a > button nesting
              return (
                <LightboxTrigger index={index} className="cursor-pointer">
                  <Image
                    fill={fill}
                    src={src}
                    alt={alt}
                    width={w}
                    height={h}
                    {...attributesToProps(imgRest)}
                  />
                </LightboxTrigger>
              );
            }
          }

          return (
            <Link href={href} {...attributesToProps(rest)}>
              {domToReact(domNode.children as DOMNode[], options)}
            </Link>
          );
        }
        if (domNode.tagName === 'img') {
          const { src, alt = '', width, height, ...rest } = domNode.attribs;
          // Only use Next.js Image for configured host
          if (isConfiguredHost(src)) {
            const fill = width === '' || height === '';
            const w = width !== '' ? parseInt(width, 10) : undefined;
            const h = height !== '' ? parseInt(height, 10) : undefined;

            slides.push({
              src,
              width: w,
              height: h,
              alt,
            });
            const index = slides.length - 1;

            return (
              <LightboxTrigger index={index} className="cursor-pointer">
                <Image
                  fill={fill}
                  src={src}
                  alt={alt}
                  width={w}
                  height={h}
                  {...attributesToProps(rest)}
                />
              </LightboxTrigger>
            );
          }
        }
        if (
          domNode.tagName === 'table' &&
          domNode.children.find(
            (child) => child instanceof Element && child.tagName === 'tbody',
          ) === undefined
        ) {
          return (
            <table {...attributesToProps(domNode.attribs)}>
              <tbody>
                {domToReact(domNode.children as DOMNode[], options)}
              </tbody>
            </table>
          );
        }
        if (domNode.attribs.class?.includes('column-embed')) {
          const anchor = findNode(
            domNode,
            (n) => n instanceof Element && n.tagName === 'a',
          ) as Element | undefined;

          if (anchor) {
            const titleNode = findNode(
              anchor,
              (n) =>
                n instanceof Element &&
                !!n.attribs?.class?.includes('quoteTitle'),
            );
            const siteNameNode = findNode(
              anchor,
              (n) =>
                n instanceof Element &&
                !!n.attribs?.class?.includes('quoteSiteName'),
            );
            const descriptionNode = findNode(
              anchor,
              (n) =>
                n instanceof Element &&
                !!n.attribs?.class?.includes('quoteDescription'),
            );
            const imageNode = findNode(
              anchor,
              (n) => n instanceof Element && n.tagName === 'img',
            ) as Element | undefined;

            const title = titleNode ? getText(titleNode) : '';
            const siteName = siteNameNode ? getText(siteNameNode) : '';
            const description = descriptionNode ? getText(descriptionNode) : '';
            const imageSrc = imageNode?.attribs?.src || '';
            const { href } = anchor.attribs;

            return (
              <div className="not-format my-[1.5em] sm:my-[2em] lg:my-[1.7777778em]">
                <RichLink
                  href={href}
                  title={title}
                  siteName={siteName}
                  description={description}
                  imageSrc={imageSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </div>
            );
          }
        }
      }
    },
  };

  const content = parse(html, options);

  return <LightboxProvider slides={slides}>{content}</LightboxProvider>;
}
