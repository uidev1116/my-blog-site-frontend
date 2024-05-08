import { Header, Footer, NextNProgress, BuildInJs } from './components';
import { GoogleAnalytics } from '@next/third-parties/google';

import { getFooterNavigation, getGaId, getGlobalNavigation } from './api';
import ColorThemeContextProvider from './stores/color-theme';
import './globals.css';

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
    <html
      lang="ja"
      className="scroll-pt-20 scroll-smooth"
      suppressHydrationWarning
    >
      <body className="bg-white dark:bg-gray-900">
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
