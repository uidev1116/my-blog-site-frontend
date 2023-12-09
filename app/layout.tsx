import {
  Header,
  Footer,
  NextNProgress,
  BuildInJs,
  GoogleAnalytics,
} from './components';
import './globals.css';

export default async function RootLayout({
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
        <NextNProgress
          color="#fde047" // primary color by tailwind.config.js
          showSpinner={false}
        />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
