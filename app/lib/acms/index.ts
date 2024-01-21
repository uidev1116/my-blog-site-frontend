import { API_HOST, API_KEY } from '@/app/config/acms';
import { createClient } from '@uidev1116/acms-js-sdk';

const acmsClient = createClient({
  baseUrl: API_HOST,
  apiKey: API_KEY,
});

export default acmsClient;
