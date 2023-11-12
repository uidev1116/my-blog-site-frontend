// To-do: field, span
export type AcmsContext = {
  keyword?: string | null;
  tag?: string[];
  order?: number | null;
  page?: number | null;
  limit?: number | null;
  api?: string;
  query?: { [key: string | number]: string | string[] | undefined };
};
