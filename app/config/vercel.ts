export const VERCEL_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_VERCEL_URL
    : process.env.VERCEL_URL;
