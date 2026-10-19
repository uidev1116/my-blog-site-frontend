/**
 * 実際の時刻(Date)を、日本時間の yyyy-MM-dd HH:mm:ss にする。
 * 実行環境(UTC のビルドサーバーなど)のタイムゾーンに依存しない
 */
export default function formatJstISO9075(date: Date) {
  // sv-SE は yyyy-MM-dd HH:mm:ss の形で出力される
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
}
