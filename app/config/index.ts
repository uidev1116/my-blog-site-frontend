import { VERCEL_URL } from './vercel';

export const BASE_URL = VERCEL_URL
  ? `https://${VERCEL_URL}`
  : 'http://localhost:3000';
