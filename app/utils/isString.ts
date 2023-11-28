/**
 * Check string
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export default function isString(value: unknown): value is string {
  return typeof value === 'string';
}
