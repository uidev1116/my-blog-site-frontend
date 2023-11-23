export default function objToSearchPrams(nextSearchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(nextSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else {
      searchParams.append(key, value as string);
    }
  });
  return searchParams;
}
