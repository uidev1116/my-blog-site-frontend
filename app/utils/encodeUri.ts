/**
 * RFC 3986 に基づいてURLエンコードを行う
 * @see https://www.rfc-editor.org/rfc/rfc3986
 */
export default function encodeUri(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (match) => `%${match.charCodeAt(0).toString(16)}`,
  );
}
