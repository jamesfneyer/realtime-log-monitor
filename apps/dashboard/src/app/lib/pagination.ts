import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, { message: 'Page number must be at least 1' })
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, { message: 'Page size must be at least 1' })
    .max(100, { message: 'Page size cannot exceed 100' })
    .default(10),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  
  try {
    return paginationSchema.parse({
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 10,
    });
  } catch (error) {
    console.log('error', error);
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      throw new ValidationError('Invalid pagination parameters', 400, { issues });
    }
    throw error;
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
    },
  };
} 