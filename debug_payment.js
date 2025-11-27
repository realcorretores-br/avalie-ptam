const SUPABASE_URL = "https://nwxnsmshxrtuygixbzay.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53eG5zbXNoeHJ0dXlnaXhiemF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjY4MzMsImV4cCI6MjA3Nzg0MjgzM30.4WtjzD3NsWRsZmO1bTz4VXT7W6z5o9r5bJFE30dJmN4";

async function testFunction() {
    const url = `${SUPABASE_URL}/functions/v1/create-additional-reports-payment`;

    const payload = {
        purchaseId: "test-purchase-id",
        userId: "test-user-id",
        quantity: 1,
        totalPrice: 34.99
    };

    console.log(`Calling ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log('Body:', text);

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testFunction();
