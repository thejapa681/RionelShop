-- Create admin users Eduardo and David
-- Note: In production, you would create these users through Supabase Auth
-- and then update their profiles to admin role

-- First, let's create a function to help with admin creation
-- This function will be called after the users sign up through Supabase Auth

-- For the demo, we'll update any user with these emails to admin role
-- The actual user creation happens through Supabase Auth signup

-- Eduardo admin
UPDATE profiles 
SET role = 'admin', full_name = 'Eduardo'
WHERE email = 'eduardo@rionel.com';

-- David admin  
UPDATE profiles
SET role = 'admin', full_name = 'David'
WHERE email = 'david@rionel.com';

-- Create a site_settings table for store configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow read for everyone, write only for admins
CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('store_name', 'Rionel'),
  ('store_description', 'Sua loja online favorita'),
  ('contact_email', 'contato@rionel.com'),
  ('contact_phone', '(11) 99999-9999'),
  ('free_shipping_min', '199'),
  ('allow_guest_checkout', 'false'),
  ('maintenance_mode', 'false'),
  ('pix_enabled', 'true'),
  ('credit_card_enabled', 'true'),
  ('boleto_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
