'use client';

import { useEffect, useRef } from 'react';
import SmartPhoto from 'smartphoto';
import deepmerge from 'deepmerge';
// import 'smartphoto/css/smartphoto.min.css';

type SmartPhotoParameters = ConstructorParameters<typeof SmartPhoto>;
type SelectorOrElements = SmartPhotoParameters[0];
type Options = SmartPhotoParameters[1];

type Props = {
  selectorOrElements?: SelectorOrElements;
  options?: Partial<Options>;
};

const defaultOptions: Partial<Options> = {
  classNames: {
    smartPhoto: 'smartphoto',
    smartPhotoClose: 'smartphoto-close',
    smartPhotoBody: 'smartphoto-body',
    smartPhotoInner: 'smartphoto-inner',
    smartPhotoContent: 'smartphoto-content',
    smartPhotoImg: 'smartphoto-img',
    smartPhotoImgOnMove: 'smartphoto-img-onmove',
    smartPhotoImgElasticMove: 'smartphoto-img-elasticmove',
    smartPhotoImgWrap: 'smartphoto-img-wrap',
    smartPhotoArrows: 'smartphoto-arrows',
    smartPhotoNav: 'smartphoto-nav',
    smartPhotoArrowRight: 'smartphoto-arrow-right',
    smartPhotoArrowLeft: 'smartphoto-arrow-left',
    smartPhotoImgLeft: 'smartphoto-img-left',
    smartPhotoImgRight: 'smartphoto-img-right',
    smartPhotoList: 'smartphoto-list',
    smartPhotoListOnMove: 'smartphoto-list-onmove',
    smartPhotoHeader: 'smartphoto-header',
    smartPhotoCount: 'smartphoto-count',
    smartPhotoCaption: 'smartphoto-caption',
    smartPhotoDismiss: 'smartphoto-dismiss',
    smartPhotoLoader: 'smartphoto-loader',
    smartPhotoLoaderWrap: 'smartphoto-loader-wrap',
    smartPhotoImgClone: 'smartphoto-img-clone',
  },
  message: {
    gotoNextImage: '次の画像に移動します',
    gotoPrevImage: '前の画像に移動します',
    closeDialog: '画像ダイアログを閉じます',
  },
  arrows: true,
  nav: true,
  swipeOffset: 100,
  headerHeight: 60,
  footerHeight: 60,
  forceInterval: 10,
  registance: 0.5,
  resizeStyle: 'fit',
  verticalGravity: false,
  useOrientationApi: false,
  useHistoryApi: true,
  lazyAttribute: 'data-src',
};

export default function SmartPhotoJs({
  selectorOrElements = '.js-smartphoto',
  options = {},
}: Props) {
  const ref = useRef<SmartPhoto | null>(null);

  useEffect(() => {
    const config = deepmerge(defaultOptions, options);
    ref.current = new SmartPhoto(selectorOrElements, config);

    return () => {
      ref.current?.destroy();
    };
  }, [options, selectorOrElements]);

  return null;
}
