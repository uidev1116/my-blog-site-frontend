import { isObject } from '@/app/utils';
import AcmsFetchError from '../core/AcmsFetchError';

/**
 * Determines whether the payload is an error thrown by acms-js-sdk
 *
 * @param {*} payload The value to test
 *
 * @returns {boolean} True if the payload is an error thrown by acms-js-sdk, otherwise false
 */
export default function isAcmsFetchError(
  payload: any,
): payload is AcmsFetchError {
  return isObject(payload) && payload instanceof AcmsFetchError;
}
