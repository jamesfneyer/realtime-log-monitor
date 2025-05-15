export const dynamic = "force-dynamic";

import { alerts } from '@log-monitor/database';
import { withPaginatedDb } from '../../lib/db';
import { getPaginationParams } from '../../lib/pagination';
import { sql } from '@log-monitor/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paginationParams = getPaginationParams(searchParams);

  return withPaginatedDb(
    async (db, params) => {
      const offset = (params.page - 1) * params.limit;
      
      const [data, total] = await Promise.all([
        db
          .select()
          .from(alerts)
          .orderBy(alerts.timestamp)
          .limit(params.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(alerts)
          .then((result) => result[0].count),
      ]);

      return { data, total };
    },
    paginationParams,
    'Failed to fetch alerts'
  );
} 