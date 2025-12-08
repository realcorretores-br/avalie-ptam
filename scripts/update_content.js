import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnkbgagugpepblqrrpyr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impua2JnYWd1Z3BlcGJscXJycHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjEyNDQsImV4cCI6MjA4MDI5NzI0NH0.PuyN07QUuL_Fu89co3NOHBXUbTYY24Mv3vTecxcTRDE';

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    { section: 'hero', title: 'Avaliações Imobiliárias com Precisão e Simplicidade' },
    { section: 'features', title: 'Funcionalidades' },
    { section: 'technology', title: 'Tecnologia que Trabalha por Você' },
    { section: 'how_it_works', title: 'Como Funciona' },
    { section: 'pricing', title: 'Planos e Preços' },
    { section: 'testimonials', title: 'Nossos Clientes Recomendam' },
    { section: 'benefits', title: 'Benefícios e Diferenciais' },
    { section: 'faq', title: 'Perguntas Frequentes' },
    { section: 'final_cta', title: 'Pronto para Simplificar Suas Avaliações?' }
];

async function updateContent() {
    console.log('Starting content update...');

    for (const update of updates) {
        const { error } = await supabase
            .from('landing_content')
            .update({ title: update.title })
            .eq('section', update.section);

        if (error) {
            console.error(`Error updating ${update.section}:`, error.message);
        } else {
            console.log(`Updated ${update.section}`);
        }
    }

    console.log('Content update finished.');
}

updateContent();
