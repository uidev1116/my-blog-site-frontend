import {
  Header,
  Footer,
  NextNProgress,
  BuildInJs,
  CustomHtml,
} from './components';
import { GoogleAnalytics } from '@next/third-parties/google';

import { getFooterNavigation, getGlobalNavigation, getRootBlog } from './api';
import ColorThemeContextProvider from './stores/color-theme';
import './globals.css';

// Google AdSense のパブリッシャー ID(公開されてよい値。public/ads.txt と同じ ID)
const ADSENSE_CLIENT = 'ca-pub-1916494680308477';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rootBlog, globalNavigations, footerNavigations] = await Promise.all([
    getRootBlog(),
    getGlobalNavigation(),
    getFooterNavigation(),
  ]);

  const isProduction = process.env.NODE_ENV === 'production';
  const { gaId, scriptHead, scriptBodyStart, scriptBodyEnd } = rootBlog;

  return (
    <html lang="ja" data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* 所有確認と配信のため、静的 HTML の <head> に直接出す(next/script は <head> に出ない) */}
      {isProduction && (
        <head>
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
          {/* 管理画面(ブログ設定のカスタムフィールド)で入力した script */}
          <CustomHtml html={scriptHead} />
        </head>
      )}
      <body>
        {isProduction && <CustomHtml html={scriptBodyStart} />}
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
        {isProduction && <CustomHtml html={scriptBodyEnd} />}
      </body>
      {isProduction && gaId !== '' && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
