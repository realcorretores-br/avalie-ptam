// @ts-nocheck
// Force redeploy: 2025-12-09
// This is a Supabase Edge Function running on Deno runtime
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
    // FORCE SWITCH TO MERCADO PAGO (Bypassing DB check due to migration issues)
    /*
    const { data: gateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (gatewayError || !gateway) {
      console.error('Gateway fetch error:', gatewayError);
      throw new Error('Nenhum gateway de pagamento ativo configurado');
    }
    */
    const gateway = {
      name: 'mercadopago',
      display_name: 'Mercado Pago',
      config: { access_token_key: 'HARDCODED' }
    };

    console.log('Using payment gateway (FORCED):', gateway.display_name);

    // Determine base URL for return/callback - STRICT DOMAIN ENFORCEMENT
    // User requirement: "Utilizar um domínio estático e oficial definido em variável de ambiente, como ASASAAS_DOMAIN"
    const appDomain = Deno.env.get('ASAAS_DOMAIN') || Deno.env.get('APP_DOMAIN') || 'https://avalie-ptam.vercel.app';

    // Safety check: Ensure no localhost
    if (appDomain.includes('localhost') || appDomain.includes('127.0.0.1')) {
      console.error('Localhost detected in domain configuration, falling back to production URL');
    }

    const origin = appDomain.includes('localhost') ? 'https://avalie-ptam.vercel.app' : appDomain.replace(/\/$/, '');
    const returnUrl = `${origin}/dashboard?payment=success`;
    const cancelUrl = `${origin}/dashboard?payment=failure`;

    // Processar pagamento baseado no gateway ativo
    if (gateway.name === 'mercadopago') {
      // User provided hardcoded credentials for immediate switch
      const accessToken = 'APP_USR-4196436067933490-102406-f5fbb599bd45ccd66aad2fe22e8829dd-287066595';

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

    } else if (gateway.name === 'asaas') {
      const apiKey = gateway.config.access_token_key;
      if (!apiKey) {
        throw new Error(`Secret ${gateway.config.access_token_key} não configurado`);
      }

      console.log('Creating Asaas payment...');

      // 1. Validate CPF
      const cpfCnpj = profile.cpf ? profile.cpf.replace(/\D/g, '') : '';
      if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
        throw new Error('Não conseguimos processar a compra porque o CPF ou CNPJ do seu perfil está incompleto ou inválido. Por favor, atualize seus dados no seu perfil e tente novamente.');
      }

      // 2. Create or Get Customer
      const customerPayload = {
        name: profile.nome_completo,
        email: profile.email,
        cpfCnpj: cpfCnpj,
        mobilePhone: profile.telefone ? profile.telefone.replace(/\D/g, '') : undefined,
        externalReference: userId
      };

      // Check if customer exists
      let customerId;
      const searchResponse = await fetch(`https://sandbox.asaas.com/api/v3/customers?email=${profile.email}`, {
        headers: { 'access_token': apiKey }
      });

      const searchData = await searchResponse.json();
      if (searchData.data && searchData.data.length > 0) {
        customerId = searchData.data[0].id;
      } else {
        const createCustomerResponse = await fetch('https://sandbox.asaas.com/api/v3/customers', {
          method: 'POST',
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customerPayload)
        });
        const customerData = await createCustomerResponse.json();

        if (!createCustomerResponse.ok) {
          console.error('Asaas Customer Creation Error:', customerData);
          // Check for specific CPF error
          if (JSON.stringify(customerData).includes('invalid_object') || JSON.stringify(customerData).includes('CPF/CNPJ')) {
            throw new Error('Não conseguimos processar a compra porque o CPF ou CNPJ do seu perfil está incompleto ou inválido. Por favor, atualize seus dados no seu perfil e tente novamente.');
          }
          // Fallback for other errors
          throw new Error('Ocorreu um erro interno ao processar sua cobrança. Nossa equipe já foi notificada e está corrigindo isso. Tente novamente em alguns instantes.');
        }
        customerId = customerData.id;
      }

      // 3. Create Payment
      const paymentPayload = {
        customer: customerId,
        billingType: 'UNDEFINED', // Allows user to choose (PIX, BOLETO, CREDIT_CARD)
        value: parseFloat(plan.preco),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        description: `Pagamento Plano ${plan.nome}`,
        externalReference: JSON.stringify({ planId, userId }),
        callback: {
          successUrl: returnUrl,
          autoRedirect: true
        }
      };

      const paymentResponse = await fetch('https://sandbox.asaas.com/api/v3/payments', {
        method: 'POST',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        console.error('Asaas Payment Error:', paymentData);
        const errorString = JSON.stringify(paymentData);

        if (errorString.includes('domínio configurado')) {
          throw new Error('Neste momento não foi possível concluir a cobrança. Tente novamente em alguns instantes.');
        }

        throw new Error('Ocorreu um erro ao processar o pagamento com a operadora. Tente novamente.');
      }

      return new Response(
        JSON.stringify({ init_point: paymentData.invoiceUrl, payment_id: paymentData.id }),
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
