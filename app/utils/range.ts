export default function range(start: number, end: number, step: number = 1) {
  return Array.from(
    { length: (end - start) / step + 1 },
    (_, i) => start + i * step,
  );
}
