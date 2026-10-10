export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

export const SITE_HOST = new URL(BASE_URL).host;
export const COPYRIGHT_START_YEAR = 2023;
