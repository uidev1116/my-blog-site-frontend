export default function truncate(
  string: string,
  length: number,
  end: string = '...',
) {
  return [...string].length <= length
    ? string
    : `${string.substring(0, length)}${end}`;
}
