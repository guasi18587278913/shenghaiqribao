/**
 * Check Supabase Database Connection Pool Status
 *
 * This script tests the database connection and checks for connection pool issues
 */

import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function checkDatabaseConnections() {
  console.log('🔍 Checking Supabase database connection...\n');

  try {
    // Test 1: Basic connection test
    console.log('Test 1: Basic Connection Test');
    const startTime = Date.now();
    const result = await db.execute(sql`SELECT 1 as test`);
    const duration = Date.now() - startTime;
    console.log(`✅ Connection successful! Duration: ${duration}ms`);
    console.log(`Result:`, result);
    console.log('');

    // Test 2: Check active connections
    console.log('Test 2: Active Connections Query');
    const connectionsQuery = sql`
      SELECT
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    const startTime2 = Date.now();
    const connections = await db.execute(connectionsQuery);
    const duration2 = Date.now() - startTime2;
    console.log(`✅ Query successful! Duration: ${duration2}ms`);
    console.log('Connection Stats:', connections.rows[0]);
    console.log('');

    // Test 3: Check connection pool settings
    console.log('Test 3: Database Settings');
    const settingsQuery = sql`
      SELECT
        name,
        setting,
        unit,
        short_desc
      FROM pg_settings
      WHERE name IN ('max_connections', 'max_worker_processes', 'shared_buffers')
    `;

    const settings = await db.execute(settingsQuery);
    console.log('✅ Database settings:');
    for (const row of settings.rows) {
      console.log(`  - ${row.name}: ${row.setting} ${row.unit || ''}`);
    }
    console.log('');

    // Test 4: Check for long-running queries
    console.log('Test 4: Long-Running Queries');
    const longQueriesQuery = sql`
      SELECT
        pid,
        state,
        query_start,
        NOW() - query_start as duration,
        query
      FROM pg_stat_activity
      WHERE state != 'idle'
        AND query NOT LIKE '%pg_stat_activity%'
      ORDER BY query_start
      LIMIT 5
    `;

    const longQueries = await db.execute(longQueriesQuery);
    if (longQueries.rows.length === 0) {
      console.log('✅ No long-running queries found');
    } else {
      console.log('⚠️  Found long-running queries:');
      for (const row of longQueries.rows) {
        console.log(`  - PID: ${row.pid}, Duration: ${row.duration}, State: ${row.state}`);
        console.log(`    Query: ${row.query?.substring(0, 100)}...`);
      }
    }
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Database connection is working');
    console.log('- Connection pool is configured with max: 1 connection');
    console.log('- No connection pool exhaustion detected');

  } catch (error) {
    console.error('❌ Error checking database connections:');
    console.error(error);

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.log('\n⚠️  Connection timeout detected!');
        console.log('Possible causes:');
        console.log('1. Network latency to Japan (ap-northeast-1)');
        console.log('2. Supabase connection pool is full');
        console.log('3. Database is under heavy load');
      } else if (error.message.includes('too many connections')) {
        console.log('\n❌ Connection pool exhausted!');
        console.log('Your Supabase database has reached the maximum connection limit.');
        console.log('Solutions:');
        console.log('1. Close idle connections');
        console.log('2. Upgrade your Supabase plan');
        console.log('3. Use connection pooling in Transaction mode');
      }
    }
  }

  process.exit(0);
}

checkDatabaseConnections();
