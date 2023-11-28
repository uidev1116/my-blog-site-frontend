import { isString } from '@/app/utils';
import { AcmsContext, acmsPath } from '..';
import { getMessageFromResponse } from './utils';

type Options = {
  apiHost: string;
  apiKey: string;
};

export default function createClient({ apiHost, apiKey }: Options) {
  if (!apiHost) {
    throw new Error('apiHost is required.');
  }
  if (!apiKey) {
    throw new Error('apiKey is required.');
  }

  if (isString(apiHost) === false) {
    throw new Error('apiHost must be string.');
  }

  if (isString(apiKey) === false) {
    throw new Error('apiKey must be string.');
  }

  async function get<T = any>(
    acmsContext: AcmsContext,
    options: { requestInit?: RequestInit } = {},
  ): Promise<T> {
    const { requestInit } = options;
    const endpoint = new URL(acmsPath({ ...acmsContext }), apiHost);

    const headers = new Headers(requestInit?.headers);

    if (!headers.has('X-API-KEY')) {
      headers.set('X-API-KEY', apiKey);
    }

    try {
      const response = await fetch(endpoint, {
        ...requestInit,
        headers,
      });

      // If the response fails with any other status code, retry until the set number of attempts is reached.
      if (!response.ok) {
        const message = await getMessageFromResponse(response);

        return Promise.reject(
          new Error(
            `fetch API response status: ${response.status}${
              message ? `\n  message is \`${message}\`` : ''
            }`,
          ),
        );
      }

      return response.json();
    } catch (error) {
      return Promise.reject(new Error(`Network Error.\n  Details: ${error}`));
    }
  }
  return {
    get,
  };
}
