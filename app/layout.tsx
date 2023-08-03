import { Header, Footer } from './components';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
