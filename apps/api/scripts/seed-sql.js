#!/usr/bin/env node
// apps/api/scripts/seed-sql.js
// Run this with: node ./apps/api/scripts/seed-sql.js
// Reads DB connection from environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME)
// Creates tables (if not exists) and inserts demo organization, owner user, tasks and an audit record.

const path = require('path');
// Load the apps/api/.env explicitly so the script works when run from repo root
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Prefer DATABASE_URL if provided, otherwise use individual DB_* env vars.
const poolConfig = process.env.DATABASE_URL;
console.log(process.env.DATABASE_URL);

const pool = new Pool({ connectionString: poolConfig });

async function run() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to DB');

    await client.query(`CREATE SCHEMA IF NOT EXISTS task_management;`);
    await client.query(`SET search_path = task_management, public;`);

    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await client.query(`
    CREATE TABLE IF NOT EXISTS organization (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      "parentId" uuid NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    `);

    await client.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      username text NOT NULL UNIQUE,
      email text,
      "passwordHash" text,
      role text NOT NULL DEFAULT 'user',
      "organizationId" uuid REFERENCES organization(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    `);

    await client.query(`
    CREATE TABLE IF NOT EXISTS task (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      status integer NOT NULL DEFAULT 0,
      category text NOT NULL,
      "ownerId" uuid REFERENCES organization(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    `);

    await client.query(`
    CREATE TABLE IF NOT EXISTS audit (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      action text NOT NULL,
      meta jsonb NULL,
      "actorId" uuid REFERENCES "user"(id) ON DELETE SET NULL,
      "orgId" uuid REFERENCES organization(id) ON DELETE SET NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    );
    `);

    const orgName = process.env.SEED_ORG_NAME || 'Demo Organization';
    let res = await client.query(
      `SELECT id FROM organization WHERE name = $1 LIMIT 1`,
      [orgName]
    );
    let orgId;
    if (res.rowCount === 0) {
      res = await client.query(
        `INSERT INTO organization(name) VALUES ($1) RETURNING id`,
        [orgName]
      );
      orgId = res.rows[0].id;
      console.log('Created organization', orgId);
    } else {
      orgId = res.rows[0].id;
      console.log('Found existing organization', orgId);
    }

    const username = process.env.SEED_OWNER_USERNAME || 'owner';
    const plain = process.env.SEED_OWNER_PASSWORD || 'owner123';
    const email = process.env.SEED_OWNER_EMAIL || 'owner@example.com';
    const passwordHash = await bcrypt.hash(plain, 10);

    res = await client.query(
      `SELECT id FROM "user" WHERE username = $1 LIMIT 1`,
      [username]
    );
    let userId;
    if (res.rowCount === 0) {
      res = await client.query(
        `INSERT INTO "user" (username, email, "passwordHash", role, "organizationId") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [username, email, passwordHash, 'owner', orgId]
      );
      userId = res.rows[0].id;
      console.log('Created owner user', userId);
    } else {
      userId = res.rows[0].id;
      await client.query(
        `UPDATE "user" SET email=$1, "passwordHash"=$2, "organizationId"=$3, role=$4 WHERE id=$5`,
        [email, passwordHash, orgId, 'owner', userId]
      );
      console.log('Updated owner user', userId);
    }

    // Insert sample tasks
    const tasks = [
      {
        title: 'Welcome task',
        description: 'This is your first task',
        status: 0,
      },
      { title: 'Second task', description: 'Another sample task', status: 1 },
    ];

    for (const t of tasks) {
      const existing = await client.query(
        `SELECT id FROM task WHERE title = $1 LIMIT 1`,
        [t.title]
      );
      if (existing.rowCount === 0) {
        const r = await client.query(
          `INSERT INTO task (title, description, status, category, "ownerId") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [t.title, t.description, t.status, t.category || 'general', orgId]
        );
        console.log('Inserted task', r.rows[0].id);
      } else {
        console.log('Task already exists:', t.title);
      }
    }

    // Insert an audit record
    const auditAction = 'seed.init';
    const meta = { note: 'initial SQL seed' };
    const auditRes = await client.query(
      `INSERT INTO audit(action, meta, "actorId", "orgId") VALUES ($1,$2,$3,$4) RETURNING id`,
      [auditAction, JSON.stringify(meta), userId, orgId]
    );
    console.log('Inserted audit record', auditRes.rows[0].id);

    console.log('SQL seed complete');
  } catch (err) {
    // Friendly messages for common auth/connect errors
    if (err && err.code === '28P01') {
      console.error(
        'Authentication to Postgres failed. Please verify DB credentials or DATABASE_URL.'
      );
      if (process.env.DATABASE_URL) {
        try {
          const u = new URL(process.env.DATABASE_URL);
          console.error(
            `Tried ${u.username}@${u.hostname}:${
              u.port || '5432'
            }/${u.pathname.slice(1)}`
          );
        } catch (e) {}
      } else {
        console.error(
          `Tried ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
        );
      }
    }
    console.error('Seed failed', err);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

run();
