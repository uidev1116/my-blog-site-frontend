import DocumentOutliner from 'document-outliner';
import type { ConfigType } from 'document-outliner/lib/type';

const defaultOptions: ConfigType = {
  link: true,
  listType: 'ol',
  listClassName:
    'pl-4 [&.level-1]:relative [&.level-1]:border-l [&.level-1]:border-gray-200 [&.level-1]:dark:border-gray-700 ',
  itemClassName:
    "before:content[''] before:absolute before:w-2.5 before:h-2.5 before:bg-gray-200 before:rounded-full before:mt-2 before:-left-1.5 before:border-2 before:border-white before:dark:border-gray-900 before:dark:bg-gray-700 [.level-1>&]:before:w-3 [.level-1>&]:before:h-3 [.level-1>&]:before:border",
  linkClassName:
    'block focus:ring-gray-200 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white dark:focus:ring-gray-700 text-sm/base my-2 font-medium focus:z-10 focus:outline-none',
  anchorName: 'heading-$1',
  exceptClass: 'js-except',
  levelLimit: 5,
};

export default function setupDocumentOutliner(
  element: Element,
  options: Partial<ConfigType> = {},
) {
  requestAnimationFrame(() => {
    const target = element.getAttribute('data-target');
    if (!target || !document.querySelector(target)) {
      return;
    }
    const outline = new DocumentOutliner(element);
    const overrideConfig: Partial<ConfigType> = {};
    Object.keys(defaultOptions).forEach((key) => {
      let value: any = element.getAttribute(`data-${key}`);
      if (value != null) {
        if (isNaN(value) === false) {
          value = parseInt(value, 10);
        }
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        }
        overrideConfig[key as keyof ConfigType] = value;
      }
    });
    outline.makeList(target, {
      ...defaultOptions,
      ...options,
      ...overrideConfig,
    });
  });
}
