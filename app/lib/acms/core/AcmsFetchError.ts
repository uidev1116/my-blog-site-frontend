import { AcmsResponse } from '../types';

export default class AcmsFetchError<T = any> extends Error {
  code: string;
  request: RequestInfo;
  response: AcmsResponse<T>;

  constructor(
    message: string,
    code: string,
    request: Request,
    response: AcmsResponse<T>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AcmsFetchError';
    this.code = code;
    this.request = request;
    this.response = response;
  }
}
