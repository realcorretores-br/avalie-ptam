
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(process.cwd(), '.env');
let env = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunction() {
    console.log('Checking function update_updated_at_column...');

    // Try to call the trigger function directly.
    // Expectation: Error "trigger functions can only be called as triggers"
    // If "function not found", then it's missing.

    const { error } = await supabase.rpc('update_updated_at_column');

    if (error) {
        // console.log('RPC Error:', error.message);
        if (error.message.includes('function public.update_updated_at_column() does not exist') || error.code === '42883') {
            console.log('<<FUNCTION_MISSING>>');
        } else if (error.message.includes('trigger functions can only be called')) {
            console.log('<<FUNCTION_EXISTS>>');
        } else {
            // Some other error, implies function likely exists but call failed for other reasons
            // or unexpected signature.
            // But for our purpose, if it's NOT "does not exist", it probably exists.
            console.log('<<FUNCTION_EXISTS_BUT_ERROR>>', error.message);
        }
    } else {
        // Should not happen for trigger function called directly, but if it does, it exists.
        console.log('<<FUNCTION_EXISTS>>');
    }
}

checkFunction();
