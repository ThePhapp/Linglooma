const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();

function getSslConfig(connectionString) {
    if (process.env.DB_SSL === 'false') return false;
    if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };

    try {
        const hostname = new URL(connectionString).hostname;
        return ['localhost', '127.0.0.1', 'db'].includes(hostname)
            ? false
            : { rejectUnauthorized: false };
    } catch {
        return { rejectUnauthorized: false };
    }
}

const poolConfig = {
    ...(databaseUrl
        ? {
            connectionString: databaseUrl,
            ssl: getSslConfig(databaseUrl),
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'linglooma',
            ssl: false,
        }),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);

if (process.env.NODE_ENV !== 'test') {
    console.log(`🔗 Connecting to ${databaseUrl ? 'Supabase/cloud' : 'local'} database...`);
    pool.connect((err, client, release) => {
        if (err) {
            console.error('❌ Error connecting to database:', err.message);
            console.error('Please check DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.');
        } else {
            console.log('✅ Connected to database successfully!');
            console.log(`   Host: ${client.host}:${client.port}`);
            console.log(`   Database: ${client.database}`);
            console.log(`   User: ${client.user}`);
            release();
        }
    });
}

// Xử lý lỗi pool
pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on database client:', err.message);
    console.error('The application will attempt to reconnect automatically.');
});

// Export pool
module.exports = pool;
