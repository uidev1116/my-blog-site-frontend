'use client';

import { useState, ReactNode, useCallback } from 'react';
import Lightbox, { Slide } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import NextJsImage from './NextJsImage';
import { LightboxContext } from './LightboxContext';

interface Props {
  children: ReactNode;
  slides: Slide[];
}

export default function LightboxProvider({ children, slides }: Props) {
  const [index, setIndex] = useState(-1);

  const openLightbox = useCallback((index: number) => {
    setIndex(index);
  }, []);

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      {children}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        render={{ slide: NextJsImage }}
        plugins={[Zoom, Thumbnails]}
      />
    </LightboxContext.Provider>
  );
}
