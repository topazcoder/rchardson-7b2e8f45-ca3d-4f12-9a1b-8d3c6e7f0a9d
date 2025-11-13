#!/usr/bin/env node
// apps/api/scripts/apply-schema.js
// Simple script to apply create-schema.sql to the configured Postgres DB
// Usage: node ./apps/api/scripts/apply-schema.js

require('dotenv/config');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const sqlPath = path.join(__dirname, 'create-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'totcode123!',
        database: process.env.DB_NAME || 'task_management',
      };

  const pool = new Pool(poolConfig);

  let client;
  try {
    client = await pool.connect();
  } catch (connErr) {
    // Friendly error for auth failures
    if (connErr && connErr.code === '28P01') {
      console.error('Authentication to Postgres failed. Please verify your DB credentials.');
      if (process.env.DATABASE_URL) {
        try {
          const u = new URL(process.env.DATABASE_URL);
          console.error(`Tried ${u.username}@${u.hostname}:${u.port || '5432'}/${u.pathname.slice(1)}`);
        } catch (e) {
          // ignore
        }
      } else {
        console.error(`Tried ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      }
    }
    console.error('Unable to connect to the database:', connErr.message || connErr);
    process.exitCode = 1;
    await pool.end().catch(() => {});
    return;
  }
  try {
    console.log('Applying schema from', sqlPath);
    await client.query('BEGIN');
    // split statements by semicolon; keep simple — the file is trusted
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Schema applied successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to apply schema:', err);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
