import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jnkbgagugpepblqrrpyr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impua2JnYWd1Z3BlcGJscXJycHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjEyNDQsImV4cCI6MjA4MDI5NzI0NH0.PuyN07QUuL_Fu89co3NOHBXUbTYY24Mv3vTecxcTRDE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDuplicates() {
    const { data, error } = await supabase
        .from('plans')
        .select('tipo, nome, preco, id, ativo');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const counts = {};
    data.forEach(p => {
        counts[p.tipo] = (counts[p.tipo] || 0) + 1;
    });

    console.log('Counts:', counts);
    console.log('All Plans:', data);
}

checkDuplicates();
