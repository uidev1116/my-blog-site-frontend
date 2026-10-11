import domContentLoaded from 'dom-content-loaded';
import lazyLoadFn from './lazy-load-fn';
import { ScrollHintOption } from 'scroll-hint';
import { ConfigType } from 'document-outliner/lib/type';
import isExternalLink from '@/app/utils/isExternalLink';

/**
 * ExternalLinks
 * @param context
 */
const externalLinks = (context: Document | Element) => {
  const selector =
    'a:not([target]):not([href^="javascript"]):not([href^="tel"])';
  const targets = context.querySelectorAll<HTMLAnchorElement>(selector);
  [].forEach.call(targets, (target: HTMLAnchorElement) => {
    const href = target.getAttribute('href');
    if (!href) {
      return;
    }
    if (!isExternalLink(href)) {
      return;
    }
    target.setAttribute('target', '_blank');
    target.setAttribute('rel', 'noopener noreferrer');
  });
};

/**
 * ScrollHint
 * @param context
 */
const scrollHint = (
  context: Document | Element,
  options: Partial<ScrollHintOption> = {},
) => {
  domContentLoaded(async () => {
    if (
      context.querySelector('.js-scroll-hint') ||
      context.querySelector('.js-table-unit-scroll-hint')
    ) {
      const { default: setup } = await import(
        /* webpackChunkName: "scroll-hint" */ './scroll-hint'
      );
      setup('.js-scroll-hint', options);
      setup('.js-table-unit-scroll-hint', { ...options, applyToParents: true });
    }
  });
};

/**
 * OpenStreetMap
 * @param context
 * @param selector
 */
const openStreetMap = (context: Document | Element, selector = '') => {
  domContentLoaded(async () => {
    const querySelector = selector || '.js-open-street-map';
    const targets = context.querySelectorAll<HTMLDivElement>(querySelector);
    if (targets.length > 0) {
      lazyLoadFn(
        querySelector,
        (elm) => elm.getAttribute('data-lazy') === 'true',
        async (item) => {
          const { default: setup } = await import(
            /* webpackChunkName: "open-street-map" */ './open-street-map'
          );
          setup(item);
        },
      );
    }
  });
};

/**
 * DocumentOutliner
 * @param {Element | Document} context
 * @param {string} selector
 * @param {object} options
 */
const documentOutliner = (
  context: Document | Element,
  selector = '.js-outline',
  options: Partial<ConfigType> = {},
) => {
  domContentLoaded(async () => {
    const targets = context.querySelectorAll<HTMLElement>(selector);
    if (targets.length > 0) {
      const { default: setup } = await import(
        /* webpackChunkName: "document-outlier" */ './document-outliner'
      );
      targets.forEach((target) => {
        setup(target, options);
      });
    }
  });
};

/**
 * 外部リンク・スクロールヒント・地図・目次を、まとめて適用する。
 * 本文を、ページの表示後にブラウザで取得して描画する画面(プレビューなど)では、本文が DOM に出てから呼ぶ
 * (ページを開いた直後に 1 回だけ呼ぶ BuildInJs では、本文がまだ無く、目次などが作られないため)
 */
const setupBuildInJs = (context: Document | Element) => {
  externalLinks(context);
  scrollHint(context);
  openStreetMap(context);
  documentOutliner(context);
};

export {
  setupBuildInJs,
  externalLinks,
  scrollHint,
  openStreetMap,
  documentOutliner,
};
