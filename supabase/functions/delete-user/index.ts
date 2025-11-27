// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Check for Service Role Key
        const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
        if (!serviceRoleKey) {
            console.error('Missing SERVICE_ROLE_KEY');
            return new Response(
                JSON.stringify({ success: false, error: 'Configuration Error: Missing SERVICE_ROLE_KEY.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // 2. Parse Body (Get user_id and fallback token)
        const body = await req.json();
        const { user_id, access_token } = body;

        if (!user_id) {
            return new Response(
                JSON.stringify({ success: false, error: 'Bad Request: User ID is required.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // 3. Determine Auth Token
        let token = access_token;

        if (!token) {
            const authHeader = req.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized: Missing Auth Token.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // 4. Create Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            serviceRoleKey
        )

        // 5. Verify User using Admin Client
        // getUser(token) validates the JWT and returns the user
        const {
            data: { user },
            error: userError
        } = await supabaseAdmin.auth.getUser(token)

        if (userError || !user) {
            console.error('Auth Error:', userError);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Unauthorized: Invalid Token.',
                    debug: {
                        authError: userError?.message
                    }
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // 6. Verify Admin Role
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profileData?.role !== 'admin') {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized: User is not an admin.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        console.log('Attempting to delete user:', user_id);

        // 7. Delete User
        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

        if (error) {
            console.error('Error deleting user:', error);
            return new Response(
                JSON.stringify({ success: false, error: `Delete Failed: ${error.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'User deleted successfully', data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: any) {
        console.error('Edge Function Error:', error.message);
        return new Response(
            JSON.stringify({ success: false, error: `Internal Error: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
