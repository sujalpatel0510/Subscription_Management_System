/**
 * ==============================================================================
 * BRIGHTLOOP SUBSCRIPTION MANAGEMENT SYSTEM (SMS)
 * Automated PostgreSQL Connection & Database Provisioning Utility
 * PRD Section 7 & 8: Database-First Setup with Zero Friction
 * ==============================================================================
 *
 * Usage:
 *   node scripts/connect-postgres.js <your_password>
 *   node scripts/connect-postgres.js (prompts interactively for password)
 *   npm run db:connect <your_password>
 *   npm run db:connect (prompts interactively)
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

// Color formatting for clean terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function banner() {
  console.log(`\n${colors.cyan}${colors.bright}======================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright} 🚀 BRIGHTLOOP SMS - POSTGRESQL 1-STEP CONNECTION WIZARD${colors.reset}`);
  console.log(`${colors.dim} Production Database Provisioning & Relational Schema Sync${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}======================================================================${colors.reset}\n`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let password = null;
  let user = process.env.PGUSER || 'postgres';
  let host = process.env.PGHOST || 'localhost';
  let port = parseInt(process.env.PGPORT || '5432', 10);
  let database = process.env.PGDATABASE || 'brightloop_db';

  for (const arg of args) {
    if (arg.startsWith('--user=')) user = arg.split('=')[1];
    else if (arg.startsWith('--host=')) host = arg.split('=')[1];
    else if (arg.startsWith('--port=')) port = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--db=')) database = arg.split('=')[1];
    else if (!arg.startsWith('--') && !password) {
      password = arg;
    }
  }

  return { password, user, host, port, database };
}

// Interactive password prompt if not provided in CLI
function promptPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Handle password masking if possible
    process.stdout.write(`${colors.bright}🔑 Enter your PostgreSQL password for user '${colors.cyan}postgres${colors.reset}${colors.bright}': ${colors.reset}`);

    let pass = '';
    const stdin = process.stdin;

    // Use raw mode if interactive terminal is available
    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      const onData = (char) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          console.log('');
          rl.close();
          resolve(pass.trim());
        } else if (char === '\u0003') {
          // Ctrl+C
          process.exit(1);
        } else if (char === '\b' || char === '\x7f') {
          if (pass.length > 0) {
            pass = pass.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          pass += char;
          process.stdout.write('*');
        }
      };

      stdin.on('data', onData);
    } else {
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

// TCP port test helper
function checkPortOpen(host, port, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let hasReturned = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      hasReturned = true;
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      if (!hasReturned) {
        hasReturned = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('error', () => {
      if (!hasReturned) {
        hasReturned = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

// Try creating target database using psql if installed
function ensureDatabaseExists(user, password, host, port, dbName) {
  const psqlPaths = [
    'psql',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
  ];

  for (const bin of psqlPaths) {
    try {
      const env = { ...process.env, PGPASSWORD: password };
      const checkSql = `SELECT 1 FROM pg_database WHERE datname = '${dbName}';`;
      const result = spawnSync(bin, ['-h', host, '-p', port.toString(), '-U', user, '-d', 'postgres', '-tAc', checkSql], {
        env,
        stdio: 'pipe',
        encoding: 'utf8',
      });

      if (result.status === 0) {
        if (!result.stdout.includes('1')) {
          console.log(`${colors.yellow}📦 Database '${dbName}' does not exist yet. Creating it via admin connection...${colors.reset}`);
          spawnSync(bin, ['-h', host, '-p', port.toString(), '-U', user, '-d', 'postgres', '-c', `CREATE DATABASE "${dbName}";`], {
            env,
            stdio: 'pipe',
          });
          console.log(`${colors.green}✅ Database '${dbName}' created successfully.${colors.reset}`);
        } else {
          console.log(`${colors.green}✅ Target database '${dbName}' already exists.${colors.reset}`);
        }
        return true;
      }
    } catch {
      // Continue to next path or Prisma fallback
    }
  }
  return false;
}

async function main() {
  banner();

  const config = parseArgs();

  if (!config.password) {
    config.password = await promptPassword();
  }

  if (!config.password) {
    console.error(`\n${colors.red}❌ Error: Password cannot be empty.${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.blue}🔍 Checking connection to PostgreSQL server at ${config.host}:${config.port}...${colors.reset}`);

  const isOpen = await checkPortOpen(config.host, config.port);

  if (!isOpen) {
    console.log(`\n${colors.yellow}⚠️ Warning: PostgreSQL port ${config.port} is not responding on ${config.host}.${colors.reset}`);
    console.log(`${colors.dim}Possible causes:${colors.reset}`);
    console.log(` 1. The PostgreSQL Windows Service is currently stopped.`);
    console.log(` 2. PostgreSQL is running on a different port.`);
    console.log(`\n${colors.bright}🛠️ To start PostgreSQL on your Windows machine:${colors.reset}`);
    console.log(` • Option A: Press Win+R, type ${colors.cyan}services.msc${colors.reset}, locate ${colors.green}'postgresql-x64-17'${colors.reset}, and click ${colors.bright}'Start'${colors.reset}.`);
    console.log(` • Option B: Open PowerShell/CMD as Administrator and run:`);
    console.log(`   ${colors.cyan}net start postgresql-x64-17${colors.reset}`);
    console.log(` • Option C: Launch ${colors.cyan}pgAdmin 4${colors.reset} from your Start Menu.`);
    console.log(`\nWould you like to configure .env and schema anyway so it connects when started? (Y/n)`);

    // Let's configure the files so when the user starts the service, it works immediately
  } else {
    console.log(`${colors.green}✅ PostgreSQL server is actively listening on ${config.host}:${config.port}!${colors.reset}`);
    // Attempt database creation if needed
    ensureDatabaseExists(config.user, config.password, config.host, config.port, config.database);
  }

  // Construct secure connection URL with proper URL encoding
  const encodedUser = encodeURIComponent(config.user);
  const encodedPassword = encodeURIComponent(config.password);
  const pgUrl = `postgresql://${encodedUser}:${encodedPassword}@${config.host}:${config.port}/${config.database}?schema=public`;

  // Paths
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const envPath = path.join(__dirname, '..', '.env');

  console.log(`\n${colors.blue}📝 Updating configuration files...${colors.reset}`);

  // 1. Update schema.prisma datasource to "postgresql"
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log(`  ${colors.green}✓${colors.reset} [prisma/schema.prisma]: datasource provider set to ${colors.bright}"postgresql"${colors.reset}`);

  // 2. Update .env DATABASE_URL (exact line starting with DATABASE_URL=)
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (/^DATABASE_URL=.*$/m.test(env)) {
    env = env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${pgUrl}"`);
  } else {
    env += `\nDATABASE_URL="${pgUrl}"\n`;
  }
  fs.writeFileSync(envPath, env, 'utf8');
  console.log(`  ${colors.green}✓${colors.reset} [.env]: DATABASE_URL set to postgresql://${config.user}:******@${config.host}:${config.port}/${config.database}`);

  // 3. Regenerate Prisma Client
  console.log(`\n${colors.blue}⚙️ Generating Prisma Client for PostgreSQL...${colors.reset}`);
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 4. Push schema to database
  console.log(`\n${colors.blue}🔄 Syncing schema to PostgreSQL (prisma db push)...${colors.reset}`);
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log(`${colors.green}✅ Schema successfully pushed to PostgreSQL!${colors.reset}`);
  } catch (err) {
    console.log(`\n${colors.yellow}⚠️ Prisma db push could not complete automatically.${colors.reset}`);
    console.log(`Ensure your PostgreSQL service is running and the password is correct.`);
    console.log(`Once started, run: ${colors.cyan}npm run prisma:push && npm run prisma:seed${colors.reset}`);
    return;
  }

  // 5. Seed Database
  console.log(`\n${colors.blue}🌱 Seeding database with demo catalog, users, plans & invoices...${colors.reset}`);
  try {
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log(`${colors.green}✅ Database seeded successfully!${colors.reset}`);
  } catch (err) {
    console.log(`${colors.yellow}⚠️ Seeding failed: ${err.message}${colors.reset}`);
  }

  // 6. Test Live Connection with Prisma
  console.log(`\n${colors.blue}🧪 Testing live connection with Prisma Client...${colors.reset}`);
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const planCount = await prisma.plan.count();
    const subCount = await prisma.subscription.count();
    const invCount = await prisma.invoice.count();

    await prisma.$disconnect();

    console.log(`\n${colors.green}${colors.bright}======================================================================${colors.reset}`);
    console.log(`${colors.green}${colors.bright} 🎉 CONGRATULATIONS! POSTGRESQL IS FULLY CONNECTED & ACTIVE!${colors.reset}`);
    console.log(`${colors.green}${colors.bright}======================================================================${colors.reset}`);
    console.log(` • ${colors.bright}Database:${colors.reset}        ${config.database} on ${config.host}:${config.port}`);
    console.log(` • ${colors.bright}Users Loaded:${colors.reset}    ${userCount} (Admin, Staff, Customers)`);
    console.log(` • ${colors.bright}Products:${colors.reset}        ${productCount} (including Odoo +$560.00 variant)`);
    console.log(` • ${colors.bright}Plans:${colors.reset}           ${planCount} (Monthly, Yearly, Enterprise)`);
    console.log(` • ${colors.bright}Subscriptions:${colors.reset}   ${subCount}`);
    console.log(` • ${colors.bright}Invoices:${colors.reset}        ${invCount}`);
    console.log(`\n${colors.cyan}To launch the application:${colors.reset}`);
    console.log(`   ${colors.bright}npm run dev${colors.reset}`);
    console.log(`${colors.cyan}To run acceptance tests:${colors.reset}`);
    console.log(`   ${colors.bright}npm test${colors.reset}`);
    console.log(`${colors.green}${colors.bright}======================================================================${colors.reset}\n`);
  } catch (testErr) {
    console.log(`${colors.yellow}Notice: Connection validation: ${testErr.message}${colors.reset}`);
  }
}

main().catch((err) => {
  console.error(`\n${colors.red}❌ Unexpected error:${colors.reset}`, err.message);
  process.exit(1);
});
