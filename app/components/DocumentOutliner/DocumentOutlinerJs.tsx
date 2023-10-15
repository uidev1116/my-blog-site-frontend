'use client';

import DocumentOutlier from 'document-outliner';
import { useEffect } from 'react';

type Options = Parameters<DocumentOutlier['makeList']>[1];

type Props = {
  selectorOrElements?: ConstructorParameters<typeof DocumentOutlier>[0];
  yieldSelectorOrElements?: Parameters<DocumentOutlier['makeList']>[0];
  options?: Options;
};

const defaultOptions: Options = {
  link: true,
  listType: 'ol',
  listClassName: '',
  itemClassName: '',
  linkClassName: '',
  anchorName: 'heading-$1',
  exceptClass: 'js-except',
  levelLimit: 5,
};

export default function DocumentOutlierJs({
  selectorOrElements = '.js-outline',
  yieldSelectorOrElements = '.js-outline-yield',
  options = {},
}: Props) {
  useEffect(() => {
    const config = { ...defaultOptions, ...options };
    new DocumentOutlier(selectorOrElements).makeList(
      yieldSelectorOrElements,
      config,
    );
  }, [options, selectorOrElements, yieldSelectorOrElements]);

  return null;
}
