import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';
const TARGET_EMAIL = 'jonathan@silvajonathan.me';

async function checkUserRoles() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Get user ID
        const userRes = await client.query('SELECT id FROM profiles WHERE email = $1', [TARGET_EMAIL]);
        if (userRes.rows.length === 0) {
            console.log('User not found.');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log('User ID:', userId);

        // Check user_roles
        const rolesRes = await client.query('SELECT * FROM user_roles WHERE user_id = $1', [userId]);
        console.log('User Roles:', rolesRes.rows);

        // Check if user_roles table exists and its structure
        // (Implicitly checked by query above, but let's see all roles if any)
        const allRoles = await client.query('SELECT * FROM user_roles LIMIT 5');
        console.log('Sample User Roles:', allRoles.rows);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

checkUserRoles();
