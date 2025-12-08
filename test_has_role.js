import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';
const TARGET_EMAIL = 'jonathan@silvajonathan.me';

async function testHasRole() {
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

        // Test has_role
        const res = await client.query(`SELECT public.has_role($1, 'admin') as is_admin`, [userId]);
        console.log('Is Admin (has_role):', res.rows[0].is_admin);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

testHasRole();
