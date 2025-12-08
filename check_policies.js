import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

async function checkPolicies() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // Check policies for plans table
        const plansPolicies = await client.query(`
      SELECT * FROM pg_policies WHERE tablename = 'plans';
    `);
        console.log('Policies for plans table:', plansPolicies.rows);

        // Check policies for landing_content table
        const contentPolicies = await client.query(`
      SELECT * FROM pg_policies WHERE tablename = 'landing_content';
    `);
        console.log('Policies for landing_content table:', contentPolicies.rows);

        // Check constraints for landing_content
        const constraints = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'public.landing_content'::regclass;
    `);
        console.log('Constraints for landing_content:', constraints.rows);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

checkPolicies();
