export const SUCCESS_MESSAGE = 'Request completed successfully.';
export const OFFSET_PAGINATION_SUCCESS_MESSAGE = 'Records retrieved successfully using offset pagination.';
export const CURSOR_PAGINATION_SUCCESS_MESSAGE = 'Records retrieved successfully using cursor pagination.';

export interface SuccessResponse<TData> {
  success: true;
  message: string;
  data: TData;
}

export interface OffsetPaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPaginationMetadata<TCursor extends string | number = string> {
  limit: number;
  nextCursor: TCursor | null;
  previousCursor: TCursor | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedSuccessResponse<TItem, TMetadata> {
  success: true;
  message: string;
  data: TItem[];
  pagination: TMetadata;
}

export function successResponse<TData>(
  message: string = SUCCESS_MESSAGE,
  data: TData,
): SuccessResponse<TData> {
  return {
    success: true,
    message,
    data,
  };
}

export function offsetPaginationSuccess<TItem>(
  message: string = OFFSET_PAGINATION_SUCCESS_MESSAGE,
  data: TItem[],
  pagination: OffsetPaginationMetadata,
): PaginatedSuccessResponse<TItem, OffsetPaginationMetadata> {
  return {
    success: true,
    message,
    data,
    pagination,
  };
}

export function cursorPaginationSuccess<
  TItem,
  TCursor extends string | number = string,
>(
  message: string = CURSOR_PAGINATION_SUCCESS_MESSAGE,
  data: TItem[],
  pagination: CursorPaginationMetadata<TCursor>,
): PaginatedSuccessResponse<TItem, CursorPaginationMetadata<TCursor>> {
  return {
    success: true,
    message,
    data,
    pagination,
  };
}
