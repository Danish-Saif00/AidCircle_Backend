export type ApiSuccessResponse<TData = unknown> = {
  success: true;
  message: string;
  data?: TData;
  requestId?: string;
};

export type ApiErrorDetail = {
  field?: string;
  message: string;
  code?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  requestId?: string;
  error: {
    code: string;
    details?: ApiErrorDetail[];
  };
};

export type ApiResponse<TData = unknown> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedData<TItem> = {
  items: TItem[];
  pagination: PaginationMeta;
};

export type PaginatedApiResponse<TItem> = ApiSuccessResponse<
  PaginatedData<TItem>
>;

export type AuthenticatedUser = {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type RequestContext = {
  user?: AuthenticatedUser;
  requestId?: string;
};