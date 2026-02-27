import sql from 'mssql';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'database.sql');
const seedPath = path.join(__dirname, 'seed.sql');

const dbName = process.env.DB_DATABASE;
const rawServer = process.env.DB_SERVER || 'localhost';
const [serverHost, serverInstance] = rawServer.split('\\');
const parsedPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

// Config for the specific database
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: serverHost,
  database: dbName,
  ...(!serverInstance && Number.isFinite(parsedPort) ? { port: parsedPort } : {}),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    ...(serverInstance ? { instanceName: serverInstance } : {}),
  },
};

// Config to connect to the master DB to check/create the specific DB
const masterDbConfig = { ...dbConfig, database: 'master' };

let pool;

async function executeSqlFile(filePath, dbPool) {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const commands = fileContent.split(/^\s*GO\s*$/im).filter(cmd => cmd.trim().length > 0);
  for (const command of commands) {
    // Skip USE database commands as we handle it explicitly
    if (command.trim().toUpperCase().startsWith('USE ')) continue;
    await dbPool.request().query(command);
  }
}

async function ensureDatabaseExists() {
  let masterPool;
  try {
    masterPool = await sql.connect(masterDbConfig);
    const result = await masterPool.request().query(`IF DB_ID(N'${dbName}') IS NULL CREATE DATABASE [${dbName}]`);
    if (result.rowsAffected[0] > 0) {
      console.log(`✅ Database '${dbName}' created.`);
    } else {
      console.log(`👍 Database '${dbName}' already exists.`);
    }
  } finally {
    if (masterPool) await masterPool.close();
  }
}

async function connectMssqlDB() {
  if (pool) return pool;

  try {
    // 1. Ensure the database exists before trying to connect to it
    await ensureDatabaseExists();
    
    // 2. Connect to the specific database
    pool = await sql.connect(dbConfig);
    console.log(`✅ Connected to MSSQL DB: ${dbName}`);

    // 3. Run schema creation script
    console.log('📦 Running database.sql...');
    await executeSqlFile(schemaPath, pool);
    console.log('✅ Database schema initialized/updated.');

    // 4. Run seed data script
    try {
      console.log('📦 Running seed.sql...');
      await executeSqlFile(seedPath, pool);
      console.log('✅ Seed data inserted/verified successfully!');
    } catch (seedErr) {
      if (seedErr.code !== 'ENOENT') {
        console.error('❌ Error running seed.sql:', seedErr.message);
      }
    }

    return pool;
  } catch (err) {
    console.error('❌ MSSQL Database Operation Failed! Error:', err.message);
    process.exit(1);
  }
}

export { sql, connectMssqlDB };
