import domContentLoaded from 'dom-content-loaded';
import lazyLoadFn from './lazy-load-fn';
import { SmartPhotoOption } from 'smartphoto';
import { ScrollHintOption } from 'scroll-hint';
import { ConfigType } from 'document-outliner/lib/type';

/**
 * ExternalLinks
 * @param context
 */
const externalLinks = (context: Document | Element) => {
  const selector =
    'a:not([target]):not([href^="javascript"]):not([href^="tel"])';
  const targets = context.querySelectorAll<HTMLAnchorElement>(selector);
  const innerlinkPtn = new RegExp(`${window.location.hostname}(:\\d+)*`);
  [].forEach.call(targets, (target: HTMLAnchorElement) => {
    const href = target.getAttribute('href');
    if (!href) {
      return;
    }
    if (innerlinkPtn.exec(href)) {
      return;
    }
    if (!/^(https?)?:/.test(href)) {
      return;
    }
    target.setAttribute('target', '_blank');
    target.setAttribute('rel', 'noopener noreferrer');
  });
};

/**
 * SmartPhoto
 * @param context
 * @param selector
 * @param options
 */
const smartPhoto = (
  context: Document | Element,
  selector = '',
  options: Partial<SmartPhotoOption> = {},
) => {
  domContentLoaded(async () => {
    const querySelector = selector || 'a[data-rel^=SmartPhoto],.js-smartphoto';
    const targets = context.querySelectorAll<HTMLElement>(querySelector);
    if (targets.length > 0) {
      const { default: setup } = await import(
        /* webpackChunkName: "smart-photo" */ './smart-photo'
      );
      setup(targets, options);
    }
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

// eslint-disable-next-line import/prefer-default-export
export {
  externalLinks,
  smartPhoto,
  scrollHint,
  openStreetMap,
  documentOutliner,
};
