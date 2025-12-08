import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

async function checkFunction() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
      SELECT pg_get_functiondef(oid) 
      FROM pg_proc 
      WHERE proname = 'has_role';
    `);

        if (res.rows.length > 0) {
            console.log(res.rows[0].pg_get_functiondef);
        } else {
            console.log('Function has_role not found.');
        }

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

checkFunction();
