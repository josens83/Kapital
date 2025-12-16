import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning';
      used: number;
      limit: number;
    };
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = {
    database: { status: 'error' },
    memory: { status: 'ok', used: 0, limit: 0 },
  };

  // Database health check
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const dbStart = Date.now();

      // Simple query to check database connectivity
      const { error } = await supabase.from('accounts').select('id').limit(1);

      if (error) {
        checks.database = {
          status: 'error',
          error: error.message,
          latency: Date.now() - dbStart,
        };
      } else {
        checks.database = {
          status: 'ok',
          latency: Date.now() - dbStart,
        };
      }
    } else {
      checks.database = {
        status: 'error',
        error: 'Missing Supabase configuration',
      };
    }
  } catch (error) {
    checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Memory check (if available in Node.js environment)
  try {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const limitMB = Math.round(memUsage.heapTotal / 1024 / 1024);

      checks.memory = {
        status: usedMB / limitMB > 0.9 ? 'warning' : 'ok',
        used: usedMB,
        limit: limitMB,
      };
    }
  } catch {
    // Memory check is optional, ignore errors
  }

  // Determine overall status
  let overallStatus: HealthStatus['status'] = 'healthy';
  if (checks.database.status === 'error') {
    overallStatus = 'unhealthy';
  } else if (checks.memory.status === 'warning') {
    overallStatus = 'degraded';
  }

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
    environment: process.env.NODE_ENV ?? 'development',
    checks,
  };

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}
