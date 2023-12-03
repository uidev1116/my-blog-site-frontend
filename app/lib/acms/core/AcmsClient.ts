import { isString } from '@/app/utils';
import { AcmsContext, acmsPath } from '../..';
import { getMessageFromResponse } from '../utils';
import createFetch, { createHeaders, createRequest } from '../lib/fetch';
import { AcmsClientConfig, AcmsResponse } from '../types';
import { AcmsFetchError } from '.';
import isAcmsFetchError from '../lib/isAcmsFetchError';

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
    ...options
  }: {
    baseUrl: string;
    apiKey: string;
  } & Partial<AcmsClientConfig>) {
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
    const fetch = createFetch();

    try {
      const request = this.createRequest(
        this.createUrl(acmsContextOrUrl),
        requestInit,
      );
      const response = await fetch(request);

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

  private createRequest(input: URL | RequestInfo, init?: RequestInit) {
    const headers = createHeaders(init?.headers);

    if (!headers.has('X-API-KEY')) {
      headers.set('X-API-KEY', this.apiKey);
    }

    return createRequest(input, { ...init, headers });
  }

  private createUrl(acmsContextOrUrl: AcmsContext | URL | string) {
    if (isString(acmsContextOrUrl)) {
      return new URL(acmsContextOrUrl, this.baseUrl);
    }
    if (acmsContextOrUrl instanceof URL) {
      return new URL(acmsContextOrUrl, this.baseUrl);
    }
    return new URL(acmsPath({ ...acmsContextOrUrl }), this.baseUrl);
  }

  public async get<T = any>(
    acmsContextOrUrl: AcmsContext | URL | string,
    options: Partial<AcmsClientConfig> = {},
  ): Promise<AcmsResponse<T>> {
    return this.request<T>(acmsContextOrUrl, {
      ...options,
      requestInit: { ...options.requestInit, method: 'GET' },
    });
  }

  public static isAcmsFetchError(payload: any) {
    return isAcmsFetchError(payload);
  }
}
