import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jnkbgagugpepblqrrpyr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcyMTI0NCwiZXhwIjoyMDgwMjk3MjQ0fQ.FH4XhZQGFenuu2Jqd7TCGiAr9hRWPR4aiWToBnS3UKw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function updatePrice() {
    // List all plans first
    const { data: allPlans, error: listError } = await supabase
        .from('plans')
        .select('*');

    if (listError) {
        console.error('Error listing plans:', listError);
        return;
    }

    console.log('Found plans:', allPlans.length);
    const targetPlan = allPlans.find(p => p.tipo === 'avulso');

    if (!targetPlan) {
        console.error('Target plan (avulso) not found in list');
        return;
    }

    console.log('Current Price:', targetPlan.preco);

    const { data, error } = await supabase
        .from('plans')
        .update({ preco: 40.00 })
        .eq('id', targetPlan.id)
        .select();

    if (error) {
        console.error('Error updating:', error);
    } else {
        console.log('Updated Plan:', data);
    }
}

updatePrice();
