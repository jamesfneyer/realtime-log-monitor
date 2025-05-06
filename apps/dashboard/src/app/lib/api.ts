import { LogEvent, Alert, ServiceStats } from '@log-monitor/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Fetching from:', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorText
      });
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export const api = {
  logs: {
    get: async (params?: {
      service?: string;
      level?: LogEvent['level'];
      startTime?: Date;
      endTime?: Date;
      limit?: number;
      offset?: number;
    }): Promise<PaginatedResponse<LogEvent>> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }
      return fetchApi(`/api/logs?${searchParams.toString()}`);
    },
  },

  stats: {
    get: async (): Promise<ServiceStats[]> => {
      return fetchApi('/api/stats');
    },
  },

  alerts: {
    get: async (): Promise<Alert[]> => {
      return fetchApi('/api/alerts');
    },
  },
}; 