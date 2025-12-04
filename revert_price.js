import pg from 'pg';
const { Client } = pg;

const CONNECTION_STRING = 'postgresql://postgres:P0c1vqvv57fNWRc4@db.jnkbgagugpepblqrrpyr.supabase.co:5432/postgres';

async function revertPrice() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Update price back to 34.95
        const updateRes = await client.query("UPDATE plans SET preco = 34.95 WHERE tipo = 'avulso' RETURNING *");
        console.log('Reverted Plan:', updateRes.rows[0]);

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

revertPrice();
