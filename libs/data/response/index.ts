export interface ResponseData<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
