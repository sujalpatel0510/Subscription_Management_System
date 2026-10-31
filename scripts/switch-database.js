/**
 * Database Switcher Script
 * PRD Section 8.2: Configures Prisma datasource and .env for PostgreSQL or SQLite
 *
 * Usage:
 *   node scripts/switch-database.js postgres "postgresql://postgres:password123@localhost:5432/brightloop_db?schema=public"
 *   node scripts/switch-database.js sqlite
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = (process.argv[2] || 'postgres').toLowerCase();
const customUrl = process.argv[3];

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '..', '.env');

let schema = fs.readFileSync(schemaPath, 'utf8');
let env = fs.readFileSync(envPath, 'utf8');

if (target === 'postgres' || target === 'postgresql') {
  const pgUrl = customUrl || 'postgresql://postgres:password123@localhost:5432/brightloop_db?schema=public';
  console.log(`🔄 Switching to PostgreSQL (${pgUrl})...`);

  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  env = env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${pgUrl}"`);

  fs.writeFileSync(schemaPath, schema);
  fs.writeFileSync(envPath, env);

  console.log('Regenerating Prisma Client for PostgreSQL...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Successfully configured for PostgreSQL!');
  console.log('Run the following commands to initialize your PostgreSQL database:');
  console.log('  1. npx prisma db push');
  console.log('  2. node prisma/seed.js');
} else {
  console.log('🔄 Switching to local SQLite (zero-config)...');

  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  env = env.replace(/^DATABASE_URL=.*$/m, 'DATABASE_URL="file:./dev.db"');

  fs.writeFileSync(schemaPath, schema);
  fs.writeFileSync(envPath, env);

  console.log('Regenerating Prisma Client for SQLite...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Successfully configured for SQLite!');
  console.log('Run the following commands to initialize your database:');
  console.log('  1. npx prisma db push');
  console.log('  2. node prisma/seed.js');
}
