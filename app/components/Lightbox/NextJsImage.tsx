import Image, { StaticImageData } from 'next/image';
import {
  isImageFitCover,
  isImageSlide,
  useLightboxProps,
  Slide,
  RenderSlideProps,
} from 'yet-another-react-lightbox';

function isNextJsImage(slide: Slide) {
  return (
    isImageSlide(slide) &&
    typeof slide.width === 'number' &&
    typeof slide.height === 'number'
  );
}

export default function NextJsImage({ slide, rect }: RenderSlideProps) {
  const { imageFit } = useLightboxProps().carousel;
  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit);

  if (!isNextJsImage(slide)) return undefined;

  const { width: slideWidth, height: slideHeight } = slide as {
    width: number;
    height: number;
  };
  const src = slide.src as string | StaticImageData;
  const blurDataURL = (slide as { blurDataURL?: string }).blurDataURL;

  const width = !cover
    ? Math.round(Math.min(rect.width, (rect.height / slideHeight) * slideWidth))
    : rect.width;

  const height = !cover
    ? Math.round(Math.min(rect.height, (rect.width / slideWidth) * slideHeight))
    : rect.height;

  return (
    <div style={{ position: 'relative', width, height }}>
      <Image
        fill
        alt=""
        src={src}
        loading="eager"
        draggable={false}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
        style={{
          objectFit: cover ? 'cover' : 'contain',
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
      />
    </div>
  );
}
