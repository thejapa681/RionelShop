-- =============================================
-- SEED DATA FOR RIONEL E-COMMERCE
-- =============================================

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Eletrônicos', 'eletronicos', 'Smartphones, tablets, computadores e mais', '/placeholder.svg?height=200&width=200', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Moda Feminina', 'moda-feminina', 'Roupas, calçados e acessórios femininos', '/placeholder.svg?height=200&width=200', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Moda Masculina', 'moda-masculina', 'Roupas, calçados e acessórios masculinos', '/placeholder.svg?height=200&width=200', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Casa e Decoração', 'casa-decoracao', 'Móveis, decoração e utilidades', '/placeholder.svg?height=200&width=200', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Esportes', 'esportes', 'Equipamentos e roupas esportivas', '/placeholder.svg?height=200&width=200', 5),
  ('c1000000-0000-0000-0000-000000000006', 'Beleza', 'beleza', 'Cosméticos, perfumes e cuidados pessoais', '/placeholder.svg?height=200&width=200', 6),
  ('c1000000-0000-0000-0000-000000000007', 'Games', 'games', 'Consoles, jogos e acessórios', '/placeholder.svg?height=200&width=200', 7),
  ('c1000000-0000-0000-0000-000000000008', 'Livros', 'livros', 'Livros físicos e e-books', '/placeholder.svg?height=200&width=200', 8);

-- Insert Products
INSERT INTO products (id, name, slug, description, short_description, price, compare_price, stock, category_id, is_active, is_featured, is_new, rating, review_count, sold_count, sku) VALUES
  -- Eletrônicos
  ('p1000000-0000-0000-0000-000000000001', 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'O iPhone 15 Pro Max possui chip A17 Pro, câmera de 48MP, tela Super Retina XDR de 6.7 polegadas e design em titânio. Desempenho excepcional para games e fotografia profissional.', 'Smartphone Apple com chip A17 Pro', 9499.00, 10999.00, 50, 'c1000000-0000-0000-0000-000000000001', true, true, true, 4.9, 234, 1250, 'IPH15PM256'),
  ('p1000000-0000-0000-0000-000000000002', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Galaxy S24 Ultra com S Pen integrada, câmera de 200MP, tela Dynamic AMOLED 2X de 6.8", processador Snapdragon 8 Gen 3 e recursos de IA avançados.', 'Smartphone Samsung com S Pen e câmera 200MP', 8999.00, 9999.00, 45, 'c1000000-0000-0000-0000-000000000001', true, true, true, 4.8, 189, 980, 'SGS24U'),
  ('p1000000-0000-0000-0000-000000000003', 'MacBook Pro 14" M3 Pro', 'macbook-pro-14-m3-pro', 'MacBook Pro com chip M3 Pro, 18GB de memória unificada, SSD de 512GB, tela Liquid Retina XDR e até 17 horas de bateria.', 'Notebook Apple M3 Pro para profissionais', 17999.00, 19999.00, 25, 'c1000000-0000-0000-0000-000000000001', true, true, false, 4.9, 156, 520, 'MBP14M3P'),
  ('p1000000-0000-0000-0000-000000000004', 'AirPods Pro 2ª Geração', 'airpods-pro-2-geracao', 'AirPods Pro com cancelamento de ruído ativo, áudio espacial personalizado, chip H2 e estojo com carregamento MagSafe e USB-C.', 'Fones Apple com cancelamento de ruído', 1899.00, 2199.00, 120, 'c1000000-0000-0000-0000-000000000001', true, true, false, 4.7, 445, 2100, 'APP2G'),
  ('p1000000-0000-0000-0000-000000000005', 'Smart TV LG OLED 55" 4K', 'smart-tv-lg-oled-55-4k', 'TV LG OLED evo com processador α9 Gen6, Dolby Vision IQ, Dolby Atmos, webOS 23 e design ultra fino.', 'TV OLED 55 polegadas com Dolby Vision', 5999.00, 7499.00, 30, 'c1000000-0000-0000-0000-000000000001', true, true, false, 4.8, 98, 320, 'LGOLED55'),
  
  -- Moda Feminina
  ('p1000000-0000-0000-0000-000000000006', 'Vestido Midi Floral Premium', 'vestido-midi-floral-premium', 'Vestido midi com estampa floral exclusiva, tecido fluido e confortável, perfeito para ocasiões especiais ou uso casual elegante.', 'Vestido elegante com estampa floral', 189.90, 299.90, 80, 'c1000000-0000-0000-0000-000000000002', true, true, true, 4.6, 167, 890, 'VMFP001'),
  ('p1000000-0000-0000-0000-000000000007', 'Bolsa Transversal Couro', 'bolsa-transversal-couro', 'Bolsa transversal em couro legítimo, forro interno, múltiplos compartimentos, alça ajustável. Design versátil para o dia a dia.', 'Bolsa em couro legítimo com alça ajustável', 299.90, 449.90, 60, 'c1000000-0000-0000-0000-000000000002', true, false, false, 4.5, 89, 450, 'BTC001'),
  ('p1000000-0000-0000-0000-000000000008', 'Tênis Casual Feminino Branco', 'tenis-casual-feminino-branco', 'Tênis casual em couro sintético premium, solado confortável, design minimalista e versátil para combinações diversas.', 'Tênis confortável para uso diário', 199.90, 279.90, 100, 'c1000000-0000-0000-0000-000000000002', true, true, false, 4.4, 234, 1200, 'TCFB001'),
  
  -- Moda Masculina
  ('p1000000-0000-0000-0000-000000000009', 'Camisa Social Slim Fit', 'camisa-social-slim-fit', 'Camisa social em algodão egípcio, corte slim fit, botões em madrepérola, perfeita para ocasiões formais ou casuais elegantes.', 'Camisa em algodão egípcio slim fit', 159.90, 219.90, 90, 'c1000000-0000-0000-0000-000000000003', true, true, false, 4.6, 178, 920, 'CSSF001'),
  ('p1000000-0000-0000-0000-000000000010', 'Jaqueta Jeans Masculina', 'jaqueta-jeans-masculina', 'Jaqueta jeans clássica com lavagem moderna, detalhes em metal, bolsos funcionais e forro interno confortável.', 'Jaqueta jeans com design clássico', 249.90, 349.90, 55, 'c1000000-0000-0000-0000-000000000003', true, false, true, 4.5, 123, 670, 'JJM001'),
  ('p1000000-0000-0000-0000-000000000011', 'Relógio Masculino Aço Inox', 'relogio-masculino-aco-inox', 'Relógio analógico em aço inoxidável, movimento quartzo japonês, resistente à água 50m, vidro mineral.', 'Relógio elegante em aço inoxidável', 399.90, 599.90, 40, 'c1000000-0000-0000-0000-000000000003', true, true, false, 4.7, 89, 340, 'RMAI001'),
  
  -- Casa e Decoração
  ('p1000000-0000-0000-0000-000000000012', 'Sofá Retrátil 3 Lugares', 'sofa-retratil-3-lugares', 'Sofá retrátil e reclinável em suede premium, estrutura em madeira maciça, espuma D33, ideal para salas modernas.', 'Sofá confortável retrátil e reclinável', 2499.00, 3299.00, 20, 'c1000000-0000-0000-0000-000000000004', true, true, false, 4.8, 67, 180, 'SR3L001'),
  ('p1000000-0000-0000-0000-000000000013', 'Luminária de Piso Moderna', 'luminaria-piso-moderna', 'Luminária de piso em metal com acabamento dourado, base estável, soquete E27, design contemporâneo.', 'Luminária decorativa design moderno', 349.90, 449.90, 35, 'c1000000-0000-0000-0000-000000000004', true, false, true, 4.4, 45, 210, 'LPM001'),
  ('p1000000-0000-0000-0000-000000000014', 'Kit Jogo de Cama King 400 Fios', 'kit-jogo-cama-king-400-fios', 'Jogo de cama king size 400 fios em algodão egípcio, inclui lençol, fronhas e porta travesseiro.', 'Jogo de cama luxuoso 400 fios', 599.90, 799.90, 45, 'c1000000-0000-0000-0000-000000000004', true, true, false, 4.6, 134, 520, 'JCKF001'),
  
  -- Esportes
  ('p1000000-0000-0000-0000-000000000015', 'Tênis Nike Air Max 90', 'tenis-nike-air-max-90', 'Tênis Nike Air Max 90 com amortecimento Air visível, cabedal em mesh e couro sintético, design icônico dos anos 90.', 'Tênis clássico Nike com Air Max', 799.90, 999.90, 70, 'c1000000-0000-0000-0000-000000000005', true, true, true, 4.8, 312, 1850, 'NAM90001'),
  ('p1000000-0000-0000-0000-000000000016', 'Bicicleta Mountain Bike Aro 29', 'bicicleta-mtb-aro-29', 'Bicicleta MTB com quadro em alumínio, 21 marchas Shimano, freios a disco, suspensão dianteira.', 'MTB profissional aro 29', 1899.00, 2499.00, 15, 'c1000000-0000-0000-0000-000000000005', true, false, false, 4.7, 78, 230, 'BMB29001'),
  ('p1000000-0000-0000-0000-000000000017', 'Esteira Elétrica Profissional', 'esteira-eletrica-profissional', 'Esteira elétrica com motor 2.5HP, velocidade até 16km/h, inclinação automática, display LCD, monitoramento cardíaco.', 'Esteira para treino profissional', 3499.00, 4299.00, 12, 'c1000000-0000-0000-0000-000000000005', true, true, false, 4.6, 56, 145, 'EEP001'),
  
  -- Beleza
  ('p1000000-0000-0000-0000-000000000018', 'Perfume Masculino 100ml', 'perfume-masculino-100ml', 'Eau de Parfum masculino com notas de bergamota, lavanda e madeira de cedro. Fragrância sofisticada e duradoura.', 'Perfume sofisticado para homens', 299.90, 399.90, 85, 'c1000000-0000-0000-0000-000000000006', true, true, false, 4.5, 198, 890, 'PM100001'),
  ('p1000000-0000-0000-0000-000000000019', 'Kit Skincare Completo', 'kit-skincare-completo', 'Kit completo com sabonete facial, tônico, sérum vitamina C, hidratante e protetor solar FPS 50.', 'Kit skincare 5 produtos', 249.90, 349.90, 60, 'c1000000-0000-0000-0000-000000000006', true, true, true, 4.7, 234, 1120, 'KSC001'),
  ('p1000000-0000-0000-0000-000000000020', 'Secador de Cabelo Profissional', 'secador-cabelo-profissional', 'Secador íon 2200W, 2 velocidades, 3 temperaturas, bico concentrador e difusor inclusos.', 'Secador profissional 2200W', 199.90, 299.90, 50, 'c1000000-0000-0000-0000-000000000006', true, false, false, 4.4, 167, 780, 'SCP001'),
  
  -- Games
  ('p1000000-0000-0000-0000-000000000021', 'PlayStation 5 Console', 'playstation-5-console', 'Console PlayStation 5 com SSD ultra-rápido, ray tracing, áudio 3D Tempest, controle DualSense com feedback háptico.', 'Console PS5 com DualSense', 4499.00, 4999.00, 25, 'c1000000-0000-0000-0000-000000000007', true, true, false, 4.9, 456, 2100, 'PS5001'),
  ('p1000000-0000-0000-0000-000000000022', 'Xbox Series X', 'xbox-series-x', 'Console Xbox Series X com 12 teraflops de poder gráfico, SSD 1TB, Quick Resume e retrocompatibilidade.', 'Console Xbox mais potente', 4299.00, 4799.00, 20, 'c1000000-0000-0000-0000-000000000007', true, true, false, 4.8, 312, 1650, 'XSX001'),
  ('p1000000-0000-0000-0000-000000000023', 'Headset Gamer RGB 7.1', 'headset-gamer-rgb-71', 'Headset gamer com som surround 7.1, RGB personalizável, microfone retrátil com cancelamento de ruído.', 'Headset gaming som surround', 349.90, 449.90, 75, 'c1000000-0000-0000-0000-000000000007', true, false, true, 4.6, 234, 980, 'HGR71001'),
  
  -- Livros
  ('p1000000-0000-0000-0000-000000000024', 'Box Harry Potter Coleção Completa', 'box-harry-potter-colecao-completa', 'Coleção completa com os 7 livros de Harry Potter em capa dura, edição especial de colecionador.', 'Coleção completa Harry Potter', 399.90, 549.90, 40, 'c1000000-0000-0000-0000-000000000008', true, true, false, 4.9, 567, 2890, 'BXHP001'),
  ('p1000000-0000-0000-0000-000000000025', 'O Poder do Hábito', 'o-poder-do-habito', 'Best-seller de Charles Duhigg sobre como os hábitos funcionam e como transformá-los para melhorar sua vida.', 'Livro sobre desenvolvimento pessoal', 49.90, 69.90, 120, 'c1000000-0000-0000-0000-000000000008', true, true, false, 4.7, 890, 4560, 'PDH001');

-- Insert Product Images
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
  ('p1000000-0000-0000-0000-000000000001', '/placeholder.svg?height=500&width=500', 'iPhone 15 Pro Max', 0, true),
  ('p1000000-0000-0000-0000-000000000001', '/placeholder.svg?height=500&width=500', 'iPhone 15 Pro Max câmera', 1, false),
  ('p1000000-0000-0000-0000-000000000002', '/placeholder.svg?height=500&width=500', 'Samsung Galaxy S24 Ultra', 0, true),
  ('p1000000-0000-0000-0000-000000000003', '/placeholder.svg?height=500&width=500', 'MacBook Pro 14"', 0, true),
  ('p1000000-0000-0000-0000-000000000004', '/placeholder.svg?height=500&width=500', 'AirPods Pro', 0, true),
  ('p1000000-0000-0000-0000-000000000005', '/placeholder.svg?height=500&width=500', 'Smart TV LG OLED', 0, true),
  ('p1000000-0000-0000-0000-000000000006', '/placeholder.svg?height=500&width=500', 'Vestido Midi Floral', 0, true),
  ('p1000000-0000-0000-0000-000000000007', '/placeholder.svg?height=500&width=500', 'Bolsa Transversal', 0, true),
  ('p1000000-0000-0000-0000-000000000008', '/placeholder.svg?height=500&width=500', 'Tênis Casual Feminino', 0, true),
  ('p1000000-0000-0000-0000-000000000009', '/placeholder.svg?height=500&width=500', 'Camisa Social', 0, true),
  ('p1000000-0000-0000-0000-000000000010', '/placeholder.svg?height=500&width=500', 'Jaqueta Jeans', 0, true),
  ('p1000000-0000-0000-0000-000000000011', '/placeholder.svg?height=500&width=500', 'Relógio Masculino', 0, true),
  ('p1000000-0000-0000-0000-000000000012', '/placeholder.svg?height=500&width=500', 'Sofá Retrátil', 0, true),
  ('p1000000-0000-0000-0000-000000000013', '/placeholder.svg?height=500&width=500', 'Luminária de Piso', 0, true),
  ('p1000000-0000-0000-0000-000000000014', '/placeholder.svg?height=500&width=500', 'Jogo de Cama King', 0, true),
  ('p1000000-0000-0000-0000-000000000015', '/placeholder.svg?height=500&width=500', 'Tênis Nike Air Max', 0, true),
  ('p1000000-0000-0000-0000-000000000016', '/placeholder.svg?height=500&width=500', 'Bicicleta MTB', 0, true),
  ('p1000000-0000-0000-0000-000000000017', '/placeholder.svg?height=500&width=500', 'Esteira Elétrica', 0, true),
  ('p1000000-0000-0000-0000-000000000018', '/placeholder.svg?height=500&width=500', 'Perfume Masculino', 0, true),
  ('p1000000-0000-0000-0000-000000000019', '/placeholder.svg?height=500&width=500', 'Kit Skincare', 0, true),
  ('p1000000-0000-0000-0000-000000000020', '/placeholder.svg?height=500&width=500', 'Secador Profissional', 0, true),
  ('p1000000-0000-0000-0000-000000000021', '/placeholder.svg?height=500&width=500', 'PlayStation 5', 0, true),
  ('p1000000-0000-0000-0000-000000000022', '/placeholder.svg?height=500&width=500', 'Xbox Series X', 0, true),
  ('p1000000-0000-0000-0000-000000000023', '/placeholder.svg?height=500&width=500', 'Headset Gamer', 0, true),
  ('p1000000-0000-0000-0000-000000000024', '/placeholder.svg?height=500&width=500', 'Box Harry Potter', 0, true),
  ('p1000000-0000-0000-0000-000000000025', '/placeholder.svg?height=500&width=500', 'O Poder do Hábito', 0, true);

-- Insert Banners
INSERT INTO banners (title, subtitle, image_url, image_mobile_url, link_url, button_text, position, sort_order, is_active) VALUES
  ('Mega Promoção de Verão', 'Até 60% de desconto em eletrônicos', '/placeholder.svg?height=400&width=1200', '/placeholder.svg?height=300&width=600', '/categoria/eletronicos', 'Ver Ofertas', 'home', 1, true),
  ('Nova Coleção de Moda', 'Tendências que você precisa conhecer', '/placeholder.svg?height=400&width=1200', '/placeholder.svg?height=300&width=600', '/categoria/moda-feminina', 'Explorar', 'home', 2, true),
  ('Games em Destaque', 'Os melhores consoles e jogos', '/placeholder.svg?height=400&width=1200', '/placeholder.svg?height=300&width=600', '/categoria/games', 'Jogar Agora', 'home', 3, true),
  ('Frete Grátis', 'Em compras acima de R$ 199', '/placeholder.svg?height=400&width=1200', '/placeholder.svg?height=300&width=600', '/', 'Comprar', 'home', 4, true);

-- Insert Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, expires_at, is_active) VALUES
  ('BEMVINDO10', 'Desconto de 10% para novos clientes', 'percentage', 10, 100, 50, 1000, '2026-12-31 23:59:59', true),
  ('FRETEGRATIS', 'Frete grátis em compras acima de R$ 99', 'fixed', 0, 99, NULL, 500, '2026-06-30 23:59:59', true),
  ('VERAO25', 'Desconto de 25% em produtos de verão', 'percentage', 25, 150, 100, 200, '2026-03-31 23:59:59', true),
  ('RIONEL50', 'R$ 50 de desconto em compras acima de R$ 300', 'fixed', 50, 300, NULL, 100, '2026-12-31 23:59:59', true);

-- Insert Site Settings
INSERT INTO site_settings (key, value, description) VALUES
  ('store_name', '"Rionel"', 'Nome da loja'),
  ('store_description', '"Sua loja online favorita"', 'Descrição da loja'),
  ('store_email', '"contato@rionel.com.br"', 'Email de contato'),
  ('store_phone', '"(11) 99999-9999"', 'Telefone de contato'),
  ('store_address', '{"street": "Av. Paulista, 1000", "city": "São Paulo", "state": "SP", "zip": "01310-100"}'::jsonb, 'Endereço da loja'),
  ('shipping_free_threshold', '199', 'Valor mínimo para frete grátis'),
  ('shipping_base_cost', '15.90', 'Custo base do frete'),
  ('currency', '"BRL"', 'Moeda padrão'),
  ('social_instagram', '"@rionel.oficial"', 'Instagram'),
  ('social_facebook', '"rionel.oficial"', 'Facebook'),
  ('social_twitter', '"@rionel"', 'Twitter');
