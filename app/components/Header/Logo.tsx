'use client';

import Link from 'next/link';
import Image from 'next/image';
import { isDarkMode, useColorThemeStore } from '@/app/stores/color-theme';
import { useMemo } from 'react';
import { useBrowser } from '@/app/hooks';
import { usePathname } from 'next/navigation';

export default function Logo() {
  const isBrowser = useBrowser();
  const pathname = usePathname();
  const { colorTheme } = useColorThemeStore();
  const logoImagePath = useMemo(() => {
    if (!isBrowser) {
      return '/logo-light.svg';
    }
    return isDarkMode(colorTheme) ? '/logo-dark.svg' : '/logo-light.svg';
  }, [isBrowser, colorTheme]);

  const logoImage = useMemo(
    () => (
      <Link href="/" className="flex items-center">
        <Image
          src={logoImagePath}
          alt="UiDev logo"
          width="105"
          height="30"
          priority
        />
      </Link>
    ),
    [logoImagePath],
  );

  const isHomePage = useMemo(() => pathname === '/', [pathname]);

  if (isHomePage) {
    return <h1>{logoImage}</h1>;
  }

  return <div>{logoImage}</div>;
}
