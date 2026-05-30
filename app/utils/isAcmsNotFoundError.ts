/**
 * ACMS SDK が投げたエラーが 404（Not Found）に由来するかを判定する。
 *
 * SDK は 404 などのレスポンスを `AcmsFetchError` として一旦 reject するが、
 * 内部の catch で汎用 Error に再ラップされ、`response.status` などの構造化情報が
 * 失われる。最終的なエラーには `fetch API response status: 404` という文言だけが
 * 残るため、メッセージ文字列から 404 を判定する。
 *
 * バックエンドはエントリーが存在しない場合に 404 を返す設定になっているため、
 * 「存在しない＝null/空」として扱いたい箇所で利用する。
 */
export default function isAcmsNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /response status:\s*404\b/.test(error.message);
}
