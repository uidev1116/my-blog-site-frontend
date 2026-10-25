import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CustomHtml from './CustomHtml';

const render = (html: string) =>
  renderToStaticMarkup(<CustomHtml html={html} />);

describe('CustomHtml', () => {
  it('空文字・空白だけなら何も出さない', () => {
    expect(render('')).toBe('');
    expect(render('  \n ')).toBe('');
  });

  it('インラインスクリプトの中身を、エスケープせずにそのまま出す', () => {
    const html = render('<script>if (a && b < 1) { x("<y>"); }</script>');
    expect(html).toBe('<script>if (a && b < 1) { x("<y>"); }</script>');
  });

  it('外部スクリプトの属性(src・async・data-*)を引き継ぐ', () => {
    const html = render(
      '<script async src="https://example.com/a.js" data-id="1"></script>',
    );
    expect(html).toContain('src="https://example.com/a.js"');
    expect(html).toContain('async');
    expect(html).toContain('data-id="1"');
  });

  it('script 以外の要素(meta・noscript・div)も、複数まとめて出す', () => {
    const html = render(
      '<meta name="x" content="1"><noscript><img src="a.gif"></noscript><div class="c">本文</div>',
    );
    expect(html).toContain('<meta name="x" content="1"/>');
    expect(html).toContain('<div class="c">本文</div>');
    expect(html).toContain('<noscript>');
  });
});
