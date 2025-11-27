-- Rode este comando no SQL Editor do Supabase para promover o usuário a admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'jonathan@silvajonathan.me';

-- Verifique se deu certo
SELECT * FROM profiles WHERE email = 'jonathan@silvajonathan.me';
