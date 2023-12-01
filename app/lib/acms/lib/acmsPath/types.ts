// To-do: field, span
export type AcmsContext = {
  blog?: string | number;
  category?: string | string[] | number;
  entry?: string | number;
  uid?: number;
  tag?: string[];
  field?: string;
  start?: string | Date;
  span?: { start?: string | Date; end?: string | Date };
  end?: string | Date;
  date?: number[];
  page?: number;
  order?: string;
  limit?: number;
  keyword?: string;
  tpl?: string;
  api?: string;
  searchParams?: ConstructorParameters<typeof URLSearchParams>[0];
};
