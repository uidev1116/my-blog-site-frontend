import ScrollHint, { ScrollHintOption } from 'scroll-hint';
import 'scroll-hint/css/scroll-hint.css';

export default function setupScrollHint(
  elements: string | NodeListOf<HTMLElement>,
  options: Partial<ScrollHintOption> = {},
) {
  const defaultOptions: ScrollHintOption = {
    suggestClass: 'is-active',
    scrollableClass: 'is-scrollable',
    scrollableRightClass: 'is-right-scrollable',
    scrollableLeftClass: 'is-left-scrollable',
    scrollHintClass: 'scroll-hint',
    scrollHintIconClass: 'scroll-hint-icon',
    scrollHintIconAppendClass: 'scroll-hint-icon-white',
    scrollHintIconWrapClass: 'scroll-hint-icon-wrap',
    scrollHintText: 'scroll-hint-text',
    // @ts-ignore
    remainingTime: -1,
    scrollHintBorderWidth: 10,
    enableOverflowScrolling: true,
    suggestiveShadow: false,
    applyToParents: false,
    i18n: {
      scrollable: 'スクロールできます',
    },
  };

  new ScrollHint(elements, Object.assign(defaultOptions, options));
}
