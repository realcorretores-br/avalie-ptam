import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Credentials from user
const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');

async function applyMigrations() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // Get list of migration files
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Sort by name (timestamp)

        for (const file of files) {
            console.log(`Applying migration: ${file}`);
            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

            try {
                await client.query(sql);
                console.log(`  -> Success`);
            } catch (err) {
                console.error(`  -> Error applying ${file}:`, err.message);
            }
        }

        // Apply root setup scripts that seem important
        const rootScripts = [
            'setup_landing_content.sql',
            'create_admin_user.sql',
            'setup_abacatepay.sql',
            'switch_to_mercadopago.sql'
        ];

        for (const script of rootScripts) {
            const scriptPath = path.join(__dirname, script);
            if (fs.existsSync(scriptPath)) {
                console.log(`Applying root script: ${script}`);
                const sql = fs.readFileSync(scriptPath, 'utf8');
                try {
                    await client.query(sql);
                    console.log(`  -> Success`);
                } catch (err) {
                    console.error(`  -> Error applying ${script}:`, err.message);
                }
            }
        }

        console.log('All migrations applied.');

    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await client.end();
    }
}

applyMigrations();
