export default function deleteNewLine(string: string): string {
  return string.replace(/\r?\n/g, '');
}
