
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .ilike('nome', '%PTAM Start%')

if (error) {
    console.error('Error fetching plans:', error)
} else {
    console.log('Plans found:', plans)
}
