export default function isDateString(string: string): boolean {
  return !isNaN(Date.parse(string));
}
