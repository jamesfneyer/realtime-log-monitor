import { createDbClient } from '@log-monitor/database';
import { NextResponse } from 'next/server';
import { PaginationParams, PaginatedResponse } from './pagination';

type ApiResponse<T> = NextResponse<T | { error: string }>;

export async function withDb<T>(
  operation: (db: ReturnType<typeof createDbClient>) => Promise<T>,
  errorMessage: string
): Promise<ApiResponse<T>> {
  try {
    const db = createDbClient();
    const result = await operation(db);
    return NextResponse.json(result);
  } catch (error) {
    console.error(errorMessage, error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function withPaginatedDb<T>(
  operation: (db: ReturnType<typeof createDbClient>, params: PaginationParams) => Promise<{
    data: T[];
    total: number;
  }>,
  params: PaginationParams,
  errorMessage: string
): Promise<ApiResponse<PaginatedResponse<T>>> {
  try {
    const db = createDbClient();
    const { data, total } = await operation(db, params);
    return NextResponse.json({
      data,
      pagination: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        total,
        totalPages: Math.ceil(total / (params.limit ?? 10)),
        hasNextPage: (params.page ?? 1) < Math.ceil(total / (params.limit ?? 10)),
      },
    });
  } catch (error) {
    console.error(errorMessage, error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 