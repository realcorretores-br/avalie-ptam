import pg from 'pg';
const { Client } = pg;

// Connection string from .env (or hardcoded for now since I know it)
const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

const TARGET_EMAIL = 'jonathan@silvajonathan.me';

async function promoteUser() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // Check if user exists in profiles
        const res = await client.query('SELECT * FROM profiles WHERE email = $1', [TARGET_EMAIL]);

        if (res.rows.length === 0) {
            console.log(`User with email ${TARGET_EMAIL} not found in profiles.`);
            console.log('Please ask the user to sign up first.');
            return;
        }

        const user = res.rows[0];
        console.log(`Found user: ${user.nome_completo} (${user.id})`);

        // Update role
        await client.query("UPDATE profiles SET role = 'admin' WHERE id = $1", [user.id]);
        console.log(`User ${TARGET_EMAIL} promoted to admin successfully.`);

        // Verify
        const verify = await client.query('SELECT role FROM profiles WHERE id = $1', [user.id]);
        console.log('New role:', verify.rows[0].role);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

promoteUser();
