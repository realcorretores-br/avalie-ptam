import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

async function checkPoliciesDetail() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Get all policies for plans
        const plansPolicies = await client.query(`
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'plans';
    `);
        console.log('--- Policies for plans ---');
        plansPolicies.rows.forEach(p => {
            console.log(`Name: ${p.policyname}`);
            console.log(`Cmd: ${p.cmd}`);
            console.log(`Qual: ${p.qual}`);
            console.log(`With Check: ${p.with_check}`);
            console.log('---');
        });

        // Get all policies for landing_content
        const contentPolicies = await client.query(`
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'landing_content';
    `);
        console.log('--- Policies for landing_content ---');
        contentPolicies.rows.forEach(p => {
            console.log(`Name: ${p.policyname}`);
            console.log(`Cmd: ${p.cmd}`);
            console.log(`Qual: ${p.qual}`);
            console.log(`With Check: ${p.with_check}`);
            console.log('---');
        });

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

checkPoliciesDetail();
