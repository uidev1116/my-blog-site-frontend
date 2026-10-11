/**
 * 現在のサイト以外へのリンクかを判定する。
 * ホスト名をパースして比較するため、クエリやパスに現在のホスト名が含まれるだけの
 * 別ホストの URL は、外部リンクとして扱う。
 */
export default function isExternalLink(url: string) {
  if (!/^(https?)?:/.test(url)) {
    return false;
  }

  try {
    return new URL(url).hostname !== globalThis.location?.hostname;
  } catch {
    return true;
  }
}
