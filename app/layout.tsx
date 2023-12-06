import { Suspense } from 'react';
import { Header, Footer, NextNProgress, BuildInJs } from './components';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="scroll-pt-2 scroll-smooth">
      <body>
        <BuildInJs />
        <Header />
        {children}
        <Footer />
        <Suspense>
          <NextNProgress
            color="#fde047" // primary color by tailwind.config.js
            showSpinner={false}
          />
        </Suspense>
      </body>
    </html>
  );
}
