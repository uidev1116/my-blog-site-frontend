export interface AcmsResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  request: Request;
}

export type ResponseType =
  | 'arrayBuffer'
  | 'blob'
  | 'formData'
  | 'json'
  | 'text';

export interface AcmsClientConfig {
  requestInit?: RequestInit;
  responseType: ResponseType;
}
