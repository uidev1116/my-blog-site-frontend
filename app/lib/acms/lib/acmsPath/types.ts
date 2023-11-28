// To-do: field, span
export type AcmsContext = {
  blog?: string | number;
  category?: string | string[] | number;
  entry?: string | number;
  keyword?: string | null;
  tag?: string[];
  order?: string | null;
  page?: number | null;
  limit?: number | null;
  api?: string;
  searchParams?: URLSearchParams;
};
