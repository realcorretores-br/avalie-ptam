import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oizdfzcksppgqikycups.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pemRmemNrc3BwZ3Fpa3ljdXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTg4NzcsImV4cCI6MjA3OTAzNDg3N30.aBPQcQAA3TevBmX8z1G61XjUMTakRUiwIj_9bGfrRIM';

const supabase = createClient(supabaseUrl, supabaseKey);

const items = [
    {
        section: 'technology',
        title: 'Cálculos conforme ABNT NBR 14653',
        description: 'Total conformidade com as normas brasileiras.',
        icon: 'Calculator',
        order_index: 1
    },
    {
        section: 'technology',
        title: 'Integração com CUB atualizado',
        description: 'Dados sempre em dia com os sindicatos estaduais.',
        icon: 'Database',
        order_index: 2
    },
    {
        section: 'technology',
        title: 'Análises automáticas',
        description: 'Liquidação forçada, taxas e depreciação calculadas instantaneamente.',
        icon: 'BarChart',
        order_index: 3
    }
];

async function fixTechnologySection() {
    console.log('Starting technology section fix...');

    // 1. Insert Items
    const { error: insertError } = await supabase
        .from('landing_items')
        .insert(items);

    if (insertError) {
        console.error('Error inserting items:', insertError.message);
    } else {
        console.log('Inserted technology items.');
    }

    // 2. Update Content Image (Placeholder)
    // Using a generic dashboard placeholder image
    const placeholderImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop';

    const { error: updateError } = await supabase
        .from('landing_content')
        .update({
            image_url: placeholderImage,
            description: 'Automatize cálculos, gere relatórios e aplique metodologias oficiais sem perder tempo com planilhas complexas e manuais.' // Updating description to match reference
        })
        .eq('section', 'technology');

    if (updateError) {
        console.error('Error updating content:', updateError.message);
    } else {
        console.log('Updated technology content image and description.');
    }

    console.log('Finished.');
}

fixTechnologySection();
