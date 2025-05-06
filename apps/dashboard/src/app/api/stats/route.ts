import { serviceStats } from '@log-monitor/database';
import { createDbClient } from '@log-monitor/database';

export async function GET() {
  try {
    const db = createDbClient();
    const data = await db
      .select()
      .from(serviceStats)
      .orderBy(serviceStats.lastUpdated);

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch service stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 