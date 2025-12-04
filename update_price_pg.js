import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

async function updatePrice() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Find plan
        const res = await client.query("SELECT * FROM plans WHERE tipo = 'avulso'");
        if (res.rows.length === 0) {
            console.log('Plan not found');
            return;
        }
        const plan = res.rows[0];
        console.log('Current Price:', plan.preco);

        // Update price
        const updateRes = await client.query("UPDATE plans SET preco = 40.00 WHERE id = $1 RETURNING *", [plan.id]);
        console.log('Updated Plan:', updateRes.rows[0]);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

updatePrice();
