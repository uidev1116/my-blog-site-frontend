import { Header, Footer, NextNProgress, BuildInJs } from './components';
import { GoogleAnalytics } from '@next/third-parties/google';

import { getFooterNavigation, getGaId, getGlobalNavigation } from './api';
import ColorThemeContextProvider from './stores/color-theme';
import './globals.css';

// Google AdSense のパブリッシャー ID(公開されてよい値。public/ads.txt と同じ ID)
const ADSENSE_CLIENT = 'ca-pub-1916494680308477';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [gaId, globalNavigations, footerNavigations] = await Promise.all([
    getGaId(),
    getGlobalNavigation(),
    getFooterNavigation(),
  ]);

  return (
    <html lang="ja" data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* 所有確認と配信のため、静的 HTML の <head> に直接出す(next/script は <head> に出ない) */}
      {process.env.NODE_ENV === 'production' && (
        <head>
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        </head>
      )}
      <body>
        <ColorThemeContextProvider>
          <BuildInJs />
          <Header navigations={globalNavigations} />
          {children}
          <Footer navigations={footerNavigations} />
          <NextNProgress
            color="#fde047" // primary color by tailwind.config.js
            showSpinner={false}
          />
        </ColorThemeContextProvider>
      </body>
      {process.env.NODE_ENV === 'production' && gaId !== '' && (
        <GoogleAnalytics gaId={gaId} />
      )}
    </html>
  );
}
