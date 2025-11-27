```typescript
// @ts-nocheck
// This is a Supabase Edge Function running on Deno runtime
// TypeScript errors are expected in IDE as it uses Node.js types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const PaymentRequestSchema = z.object({
  planId: z.string().uuid(),
  userId: z.string().uuid(),
});

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate input
    const validationResult = PaymentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Input validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({
          error: 'Invalid input data',
          details: validationResult.error.issues
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const { planId, userId } = validationResult.data;

    console.log('Processing payment request for plan:', planId, 'user:', userId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Buscar dados do plano
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Plan fetch error:', planError);
      throw new Error('Plano não encontrado');
    }

    // 2. Buscar dados do usuário (Profile) para obter CPF/Email/Nome
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('nome_completo, email, cpf, telefone')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Perfil do usuário não encontrado');
    }

    // 3. Buscar gateway de pagamento ativo
    const { data: gateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (gatewayError || !gateway) {
      console.error('Gateway fetch error:', gatewayError);
      throw new Error('Nenhum gateway de pagamento ativo configurado');
    }

    console.log('Using payment gateway:', gateway.display_name);

    // Determine base URL for return/callback
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${ origin }/dashboard?payment=success`;
const cancelUrl = `${origin}/dashboard?payment=failure`;

// Processar pagamento baseado no gateway ativo
if (gateway.name === 'mercadopago') {
  const accessToken = Deno.env.get(gateway.config.access_token_key);

  if (!accessToken) {
    throw new Error(`Secret ${gateway.config.access_token_key} não configurado`);
  }

  // Criar preferência de pagamento no Mercado Pago
  const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{
        title: plan.nome,
        description: plan.descricao,
        quantity: 1,
        unit_price: parseFloat(plan.preco),
      }],
      payer: {
        email: profile.email,
        name: profile.nome_completo,
        identification: profile.cpf ? { type: 'CPF', number: profile.cpf.replace(/\D/g, '') } : undefined
      },
      back_urls: {
        success: returnUrl,
        failure: cancelUrl,
        pending: `${origin}/dashboard?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: userId,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
    }),
  });

  const preference = await mpResponse.json();

  if (!mpResponse.ok) {
    console.error('Mercado Pago Error:', preference);
    throw new Error('Erro ao criar preferência de pagamento no Mercado Pago');
  }

  return new Response(
    JSON.stringify({ init_point: preference.init_point, preference_id: preference.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

} else if (gateway.name === 'abacatepay') {
  const apiKey = Deno.env.get(gateway.config.access_token_key);
  if (!apiKey) {
    throw new Error(`Secret ${gateway.config.access_token_key} não configurado`);
  }

  console.log('Creating AbacatePay billing...');

  // Clean CPF
  const taxId = profile.cpf ? profile.cpf.replace(/\D/g, '') : null;

  if (!taxId) {
    throw new Error('CPF é obrigatório para pagamentos via PIX. Por favor, atualize seu perfil.');
  }

  // AbacatePay requires a customer. We'll pass customer details in the billing creation if possible,
  // or we might need to create a customer first. 
  // According to AbacatePay docs (assumed), we can pass customer info directly.

  // Sanitize CPF and Phone
  const cleanTaxId = taxId.replace(/\D/g, '');
  const cleanPhone = profile.telefone ? profile.telefone.replace(/\D/g, '') : '11999999999'; // Fallback if missing, as AbacatePay requires it

  const pixPayload = {
    amount: Math.round(parseFloat(plan.preco) * 100), // Price in cents
    description: plan.descricao || `Assinatura ${plan.nome}`,
    customer: {
      name: profile.nome_completo || 'Cliente',
      email: profile.email,
      taxId: cleanTaxId,
      cellphone: cleanPhone
    },
    metadata: {
      user_id: userId,
      plan_id: planId,
      externalId: planId
    }
  };

  console.log('AbacatePay Payload:', JSON.stringify(pixPayload));

  const abacateResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pixPayload),
  });

  const pixData = await abacateResponse.json();
  console.log('AbacatePay Response Status:', abacateResponse.status);
  console.log('AbacatePay Response Body:', JSON.stringify(pixData));

  if (!abacateResponse.ok) {
    console.error('AbacatePay Error:', pixData);
    throw new Error('Erro AbacatePay: ' + (pixData.error?.message || JSON.stringify(pixData)));
  }

  console.log('AbacatePay Success:', pixData);

  // AbacatePay returns 'data.brCode' (copy-paste) and 'data.brCodeBase64' (image)
  return new Response(
    JSON.stringify({
      pix_code: pixData.data.brCode,
      pix_image: pixData.data.brCodeBase64
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

} else {
  throw new Error(`Gateway ${gateway.display_name} ainda não implementado`);
}

  } catch (error) {
  console.error('Error processing payment:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return new Response(
    JSON.stringify({ error: errorMessage }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}
});
