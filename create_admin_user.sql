DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com';

  -- If not, create user
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES (
      v_user_id,
      'admin@admin.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin User"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Insert or Update Profile
  -- Using 'nome_completo' instead of 'full_name' based on types.ts
  -- Also providing required fields like 'cep', 'cidade', 'endereco', 'estado', 'telefone' with dummy data to satisfy constraints if any (though types.ts says some are not null)
  INSERT INTO public.profiles (
    id, 
    nome_completo, 
    email, 
    role,
    cep,
    cidade,
    endereco,
    estado,
    telefone
  )
  VALUES (
    v_user_id, 
    'Admin User', 
    'admin@admin.com', 
    'admin',
    '00000-000',
    'Admin City',
    'Admin St',
    'SP',
    '11999999999'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

END $$;
