declare module 'smartphoto' {
  interface SmartPhotoOption {
    classNames?: {
      smartPhoto: string;
      smartPhotoClose: string;
      smartPhotoBody: string;
      smartPhotoInner: string;
      smartPhotoContent: string;
      smartPhotoImg: string;
      smartPhotoImgOnMove: string;
      smartPhotoImgElasticMove: string;
      smartPhotoImgWrap: string;
      smartPhotoArrows: string;
      smartPhotoNav: string;
      smartPhotoArrowRight: string;
      smartPhotoArrowLeft: string;
      smartPhotoImgLeft: string;
      smartPhotoImgRight: string;
      smartPhotoList: string;
      smartPhotoListOnMove: string;
      smartPhotoHeader: string;
      smartPhotoCount: string;
      smartPhotoCaption: string;
      smartPhotoDismiss: string;
      smartPhotoLoader: string;
      smartPhotoLoaderWrap: string;
      smartPhotoImgClone: string;
    };
    message?: {
      gotoNextImage: string;
      gotoPrevImage: string;
      closeDialog: string;
    };
    arrows?: boolean;
    nav?: boolean;
    showAnimation?: boolean;
    verticalGravity?: boolean;
    useOrientationApi?: boolean;
    useHistoryApi?: boolean;
    swipeTopToClose?: boolean;
    swipeBottomToClose?: boolean;
    swipeOffset?: number;
    headerHeight?: number;
    footerHeight?: number;
    forceInterval?: number;
    registance?: number;
    loadOffset?: number;
    resizeStyle?: 'fit' | 'cover';
    lazyAttribute?: string;
  }
}
