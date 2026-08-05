-- =============================================
-- IMERC 2026 — Seed Products & Stock
-- =============================================

-- 1. PRODUCTS (Baju / Clothing)
INSERT INTO "Product" (id, name, sku, unit, stock, price, "isClothing", sizes, "createdAt", "updatedAt") VALUES
  ('prod_jersey_merah',      'Jersey Merah',       'JRM001', 'pcs', 64,  0, true,  '["S","M","L","XL"]',    NOW(), NOW()),
  ('prod_polo_merah',        'Polo Merah',         'PLM001', 'pcs', 32,  0, true,  '["L"]',                 NOW(), NOW()),
  ('prod_jersey_man_abu',    'Jersey Man Abu',      'JMA001', 'pcs', 37,  0, true,  '["S","M","L","XL"]',    NOW(), NOW()),
  ('prod_jersey_putih',      'Jersey Putih',        'JPT001', 'pcs', 22,  0, true,  '["M","L","XL"]',        NOW(), NOW()),
  ('prod_jersey_putih_biru', 'Jersey Putih Biru',   'JPB001', 'pcs', 4,   0, true,  '["M"]',                 NOW(), NOW()),
  ('prod_jersey_putih_hitam','Jersey Putih Hitam',   'JPH001', 'pcs', 20,  0, true,  '["XL"]',                NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. PRODUCTS (Non-baju)
INSERT INTO "Product" (id, name, sku, unit, stock, price, "isClothing", "createdAt", "updatedAt") VALUES
  ('prod_goodie_bag',     'Goodie Bag',       'GDB001', 'pcs', 51,  0, false, NOW(), NOW()),
  ('prod_payung',         'Payung',           'PYG001', 'pcs', 143, 0, false, NOW(), NOW()),
  ('prod_pin_grn',        'Pin GRN',          'PIN001', 'pcs', 46,  0, false, NOW(), NOW()),
  ('prod_topi_grn_hitam', 'Topi GRN Hitam',   'TGH001', 'pcs', 91,  0, false, NOW(), NOW()),
  ('prod_topi_grn_merah', 'Topi GRN Merah',   'TGM001', 'pcs', 8,   0, false, NOW(), NOW()),
  ('prod_tumbler_putih',  'Tumbler Putih',     'TBP001', 'pcs', 197, 0, false, NOW(), NOW()),
  ('prod_tumbler_hitam',  'Tumbler Hitam',     'TBH001', 'pcs', 50,  0, false, NOW(), NOW()),
  ('prod_pouch',          'Pouch',             'PCH001', 'pcs', 935, 0, false, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. SIZE STOCKS (per-size stock untuk produk baju)
INSERT INTO "ProductSizeStock" (id, "productId", size, stock) VALUES
  -- Jersey Merah: S:8, M:18, L:24, XL:14
  (gen_random_uuid(), 'prod_jersey_merah', 'S',  8),
  (gen_random_uuid(), 'prod_jersey_merah', 'M',  18),
  (gen_random_uuid(), 'prod_jersey_merah', 'L',  24),
  (gen_random_uuid(), 'prod_jersey_merah', 'XL', 14),
  -- Polo Merah: L:32
  (gen_random_uuid(), 'prod_polo_merah', 'L', 32),
  -- Jersey Man Abu: S:8, M:14, L:11, XL:4
  (gen_random_uuid(), 'prod_jersey_man_abu', 'S',  8),
  (gen_random_uuid(), 'prod_jersey_man_abu', 'M',  14),
  (gen_random_uuid(), 'prod_jersey_man_abu', 'L',  11),
  (gen_random_uuid(), 'prod_jersey_man_abu', 'XL', 4),
  -- Jersey Putih: M:11, L:8, XL:3
  (gen_random_uuid(), 'prod_jersey_putih', 'M',  11),
  (gen_random_uuid(), 'prod_jersey_putih', 'L',  8),
  (gen_random_uuid(), 'prod_jersey_putih', 'XL', 3),
  -- Jersey Putih Biru: M:4
  (gen_random_uuid(), 'prod_jersey_putih_biru', 'M', 4),
  -- Jersey Putih Hitam: XL:20
  (gen_random_uuid(), 'prod_jersey_putih_hitam', 'XL', 20)
ON CONFLICT ("productId", size) DO NOTHING;

-- 4. STOCK TRANSACTIONS (Barang Masuk — initial stock)
INSERT INTO "StockTransaction" (id, "productId", type, quantity, size, note, "createdAt", "updatedAt") VALUES
  -- Jersey Merah
  (gen_random_uuid(), 'prod_jersey_merah', 'in', 8,  'S',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_merah', 'in', 18, 'M',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_merah', 'in', 24, 'L',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_merah', 'in', 14, 'XL', 'Stok awal', NOW(), NOW()),
  -- Polo Merah
  (gen_random_uuid(), 'prod_polo_merah', 'in', 32, 'L', 'Stok awal', NOW(), NOW()),
  -- Jersey Man Abu
  (gen_random_uuid(), 'prod_jersey_man_abu', 'in', 8,  'S',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_man_abu', 'in', 14, 'M',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_man_abu', 'in', 11, 'L',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_man_abu', 'in', 4,  'XL', 'Stok awal', NOW(), NOW()),
  -- Jersey Putih
  (gen_random_uuid(), 'prod_jersey_putih', 'in', 11, 'M',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_putih', 'in', 8,  'L',  'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_jersey_putih', 'in', 3,  'XL', 'Stok awal', NOW(), NOW()),
  -- Jersey Putih Biru
  (gen_random_uuid(), 'prod_jersey_putih_biru', 'in', 4, 'M', 'Stok awal', NOW(), NOW()),
  -- Jersey Putih Hitam
  (gen_random_uuid(), 'prod_jersey_putih_hitam', 'in', 20, 'XL', 'Stok awal', NOW(), NOW()),
  -- Non-baju
  (gen_random_uuid(), 'prod_goodie_bag',     'in', 51,  NULL, 'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_payung',         'in', 143, NULL, 'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_pin_grn',        'in', 46,  NULL, 'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_topi_grn_hitam', 'in', 91,  NULL, 'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_topi_grn_merah', 'in', 8,   NULL, 'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_tumbler_putih',  'in', 197, NULL, 'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_tumbler_hitam',  'in', 50,  NULL, 'Stok awal', NOW(), NOW()),
  (gen_random_uuid(), 'prod_pouch',          'in', 935, NULL, 'Stok awal', NOW(), NOW());
