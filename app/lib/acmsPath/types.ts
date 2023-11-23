// To-do: field, span
export type AcmsContext = {
  blog?: string | null;
  category?: string | string[] | null;
  entry?: string | null;
  keyword?: string | null;
  tag?: string[];
  order?: string | null;
  page?: number | null;
  limit?: number | null;
  api?: string;
  searchParams?: URLSearchParams;
};
