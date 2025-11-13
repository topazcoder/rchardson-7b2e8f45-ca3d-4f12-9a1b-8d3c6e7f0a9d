import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Try multiple candidate locations for the per-app .env so the loader works
// when running from source (ts-node/nest) or from compiled output (dist).
const candidates = [
  // likely when running from source: .../apps/api/src
  path.join(__dirname, '..', '.env'),
  // compiled JS might live in .../dist/apps/api/src or .../dist/apps/api
  path.join(__dirname, '..', '..', '..', 'apps', 'api', '.env'),
  path.join(__dirname, '..', '..', 'apps', 'api', '.env'),
  // when running scripts from repo root
  path.resolve(process.cwd(), 'apps', 'api', '.env'),
  // fallback to process.cwd()/.env
  path.resolve(process.cwd(), '.env'),
];

let loadedPath: string | null = null;
for (const p of candidates) {
  try {
    if (fs.existsSync(p)) {
      const result = dotenv.config({ path: p });
      if (!result.error) {
        // eslint-disable-next-line no-console
        console.log(`env-config: loaded environment from ${p}`);
        loadedPath = p;
        break;
      }
    }
  } catch (e) {
    // ignore and try next
  }
}

if (!loadedPath) {
  // eslint-disable-next-line no-console
  console.warn(
    `env-config: no .env found in expected locations. Tried: ${candidates.join(
      ', '
    )}`
  );
}

export {};
