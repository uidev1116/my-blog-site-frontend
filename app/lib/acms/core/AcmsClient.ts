import { isString } from '@/app/utils';
import { AcmsContext, acmsPath } from '../..';
import { getMessageFromResponse } from '../utils';
import createFetch from '../lib/fetch';
import { AcmsClientConfig, AcmsResponse } from '../types';
import { AcmsFetchError } from '.';

const defaultOptions: AcmsClientConfig = {
  responseType: 'json',
};

export default class AcmsClient {
  private baseUrl: string;
  private apiKey: string;
  private config: AcmsClientConfig;

  constructor({
    baseUrl,
    apiKey,
    options = {},
  }: {
    baseUrl: string;
    apiKey: string;
    options?: Partial<AcmsClientConfig>;
  }) {
    if (!baseUrl) {
      throw new Error('baseUrl is required.');
    }
    if (!apiKey) {
      throw new Error('apiKey is required.');
    }

    if (isString(baseUrl) === false) {
      throw new Error('baseUrl must be string.');
    }

    if (isString(apiKey) === false) {
      throw new Error('apiKey must be string.');
    }

    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.config = {
      ...defaultOptions,
      ...options,
    };
  }

  private async request<T = any>(
    acmsContextOrUrl: AcmsContext | URL | string,
    options: Partial<AcmsClientConfig> = {},
  ): Promise<AcmsResponse<T>> {
    const config = { ...this.config, ...options };
    const { requestInit, responseType } = config;

    let endpoint: URL;

    if (isString(acmsContextOrUrl)) {
      endpoint = new URL(acmsContextOrUrl, this.baseUrl);
    } else if (acmsContextOrUrl instanceof URL) {
      endpoint = new URL(acmsContextOrUrl, this.baseUrl);
    } else {
      endpoint = new URL(acmsPath({ ...acmsContextOrUrl }), this.baseUrl);
    }

    const fetch = createFetch(this.apiKey);

    try {
      const { request, response } = await fetch(endpoint, requestInit);
      const { ok, status, statusText, headers } = response;
      const data = await response[responseType]();
      const acmsResponse: AcmsResponse<T> = {
        data,
        status,
        statusText,
        headers,
        request,
      };

      // If the response fails with any other status code.
      if (ok === false) {
        const message = await getMessageFromResponse(response);

        return Promise.reject(
          new AcmsFetchError<T>(
            `fetch API response status: ${status}${
              message ? `\n  message is \`${message}\`` : ''
            }`,
            `${status} ${statusText}`,
            request,
            acmsResponse,
          ),
        );
      }

      return acmsResponse;
    } catch (error) {
      return Promise.reject(new Error(`Network Error.\n  Details: ${error}`));
    }
  }

  public async get<T = any>(
    acmsContextOrUrl: AcmsContext | URL | string,
    options: Partial<AcmsClientConfig> = {},
  ): Promise<AcmsResponse<T>> {
    return this.request<T>(acmsContextOrUrl, options);
  }
}
