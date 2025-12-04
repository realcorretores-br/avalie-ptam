import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

async function checkConstraints() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const constraints = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'public.plans'::regclass;
    `);
        console.log('Constraints for plans table:', constraints.rows);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

checkConstraints();
