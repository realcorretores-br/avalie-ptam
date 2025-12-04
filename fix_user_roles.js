import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';
const TARGET_EMAIL = 'jonathan@silvajonathan.me';

async function fixUserRoles() {
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

        // Insert into user_roles
        await client.query(`
      INSERT INTO user_roles (user_id, role)
      VALUES ($1, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING
    `, [userId]);
        console.log(`User ${TARGET_EMAIL} added to user_roles as admin.`);

        // Verify
        const rolesRes = await client.query('SELECT * FROM user_roles WHERE user_id = $1', [userId]);
        console.log('User Roles:', rolesRes.rows);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

fixUserRoles();
