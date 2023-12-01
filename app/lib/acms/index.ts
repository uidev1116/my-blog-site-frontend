import { API_HOST, API_KEY } from '@/app/config/acms';
import createClient from './createClient';

const acmsClient = createClient({
  baseUrl: API_HOST,
  apiKey: API_KEY,
});

export default acmsClient;
