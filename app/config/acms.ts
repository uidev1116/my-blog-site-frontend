export const API_HOST = `${process.env.ACMS_API_PROTOCOL}://${process.env.ACMS_API_HOSTNAME}${process.env.ACMS_API_PORT ? `:${process.env.ACMS_API_PORT}` : ''}`;
export const API_KEY = process.env.ACMS_API_KEY;
export const PREVIEW_KEY = process.env.ACMS_API_PREVIEW_KEY;
export const ASSETS_HOST = `${process.env.ACMS_ASSETS_PROTOCOL}://${process.env.ACMS_ASSETS_HOSTNAME}${process.env.ACMS_ASSETS_PORT ? `:${process.env.ACMS_ASSETS_PORT}` : ''}`;
export const MEDIA_BASE_URL = `${ASSETS_HOST}/media/`;
export const ARCHIVES_BASE_URL = `${ASSETS_HOST}/archives/`;
export const STORAGE_BASE_URL = `${ASSETS_HOST}/storage/`;
