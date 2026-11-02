-- =====================================================================
-- POS SYSTEM DATABASE SEED SCRIPT (ELECTRONICS STORE)
-- Domain: Computers, Laptops, Smartphones, Tablets, Audio & Accessories
-- Tables: tbl_category, tbl_brand, tbl_attribute, tbl_product_master
-- Database: backend7_project
-- =====================================================================

-- Temporarily disable foreign key checks for clean truncation and insertion
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TRUNCATE EXISTING TABLES TO PREVENT CONFLICTS
TRUNCATE TABLE `tbl_product_master`;
TRUNCATE TABLE `tbl_attribute`;
TRUNCATE TABLE `tbl_brand`;
TRUNCATE TABLE `tbl_category`;

-- =====================================================================
-- 2. SEED CATEGORIES (`tbl_category`)
-- =====================================================================
INSERT INTO `tbl_category` (`category_id`, `category_name`, `description`, `active`, `created_date`, `updated_date`)
VALUES
(1, 'Laptops & Computers', 'MacBooks, Windows Ultrabooks, High-Performance Gaming Laptops, Desktop PCs', 1, NOW(), NOW()),
(2, 'Smartphones', 'Flagship 5G Smartphones, Foldables, and Mobile Devices', 1, NOW(), NOW()),
(3, 'Tablets & iPads', 'Pro Drawing Tablets, iPads, Android Tablets, and Stylus Pens', 1, NOW(), NOW()),
(4, 'Audio & Headphones', 'Active Noise-Cancelling Headphones, True Wireless Earbuds, Studio Monitors', 1, NOW(), NOW()),
(5, 'Computer Accessories', 'Mechanical Keyboards, Precision Mice, USB-C Hubs, Fast GaN Chargers', 1, NOW(), NOW()),
(6, 'Wearables & Smartwatches', 'Fitness Trackers, Cellular Smartwatches, Health & Workout Bands', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `category_name` = VALUES(`category_name`),
  `description` = VALUES(`description`),
  `active` = VALUES(`active`),
  `updated_date` = NOW();

-- =====================================================================
-- 3. SEED BRANDS (`tbl_brand`)
-- =====================================================================
INSERT INTO `tbl_brand` (`brand_id`, `brand_name`, `description`, `image`, `active`, `created_date`, `updated_date`)
VALUES
(1, 'Apple', 'Pioneering technology devices including MacBook, iPhone, iPad, Apple Watch', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60', 1, NOW(), NOW()),
(2, 'Samsung', 'World leader in Galaxy mobile smartphones, displays, tablets, and wearables', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60', 1, NOW(), NOW()),
(3, 'Dell', 'Industry standard for enterprise and creator laptops, XPS line, and Alienware', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60', 1, NOW(), NOW()),
(4, 'ASUS', 'Gaming laptops, ROG Zephyrus series, high-end PC hardware and monitors', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60', 1, NOW(), NOW()),
(5, 'Sony', 'Pinnacle of personal audio engineering, noise cancellation, and PlayStation gear', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60', 1, NOW(), NOW()),
(6, 'Logitech', 'Leading manufacturer of productivity and esports mechanical keyboards and mice', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `brand_name` = VALUES(`brand_name`),
  `description` = VALUES(`description`),
  `image` = VALUES(`image`),
  `active` = VALUES(`active`),
  `updated_date` = NOW();

-- =====================================================================
-- 4. SEED ATTRIBUTES (`tbl_attribute`)
-- =====================================================================
INSERT INTO `tbl_attribute` (`attribute_id`, `attribute_name`, `attribute_value`, `active`, `created_date`)
VALUES
(1, 'Specs', '16GB Unified RAM / 512GB SSD', 1, NOW()),
(2, 'Specs', '32GB RAM / 1TB NVMe SSD', 1, NOW()),
(3, 'Specs', '8GB RAM / 256GB SSD', 1, NOW()),
(4, 'Storage', '128GB Storage', 1, NOW()),
(5, 'Storage', '256GB Storage', 1, NOW()),
(6, 'Storage', '512GB Storage', 1, NOW()),
(7, 'Storage', '1TB Ultra Storage', 1, NOW()),
(8, 'Color', 'Space Gray / Black', 1, NOW()),
(9, 'Color', 'Silver / White', 1, NOW()),
(10, 'Connectivity', 'Wi-Fi + 5G Cellular', 1, NOW()),
(11, 'Connectivity', 'Wireless Bluetooth 5.3 + 2.4GHz', 1, NOW()),
(12, 'Size', '46mm Titanium', 1, NOW())
ON DUPLICATE KEY UPDATE
  `attribute_name` = VALUES(`attribute_name`),
  `attribute_value` = VALUES(`attribute_value`),
  `active` = VALUES(`active`);

-- =====================================================================
-- 5. SEED PRODUCT MASTER (`tbl_product_master`)
-- =====================================================================
INSERT INTO `tbl_product_master` (
  `product_id`,
  `product_name`,
  `category_id`,
  `brand_id`,
  `attribute_id`,
  `sku`,
  `barcode`,
  `description`,
  `image`,
  `price`,
  `cost`,
  `quantity_stock`,
  `active`,
  `created_date`,
  `updated_date`
)
VALUES
(
  1,
  'MacBook Pro 14" (Apple M3 Pro)',
  1,
  1,
  1,
  'MBP14-M3-512',
  '195949123456',
  'Apple M3 Pro chip with 11-core CPU and 14-core GPU, 14.2" Liquid Retina XDR display, 18 hours battery life.',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  1999.00,
  1680.00,
  18,
  1,
  NOW(),
  NOW()
),
(
  2,
  'Dell XPS 15 (Intel Core i7, OLED 3.5K)',
  1,
  3,
  2,
  'DELL-XPS15-OLED',
  '884116345678',
  '13th Gen Intel Core i7-13700H, NVIDIA RTX 4060, stunning 15.6" 3.5K OLED InfinityEdge touch display.',
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
  1849.00,
  1490.00,
  14,
  1,
  NOW(),
  NOW()
),
(
  3,
  'ASUS ROG Zephyrus G16 (RTX 4070)',
  1,
  4,
  2,
  'ROG-G16-4070',
  '471108123456',
  'Ultra-slim gaming laptop with Intel Core Ultra 9, RTX 4070 GPU, 2.5K 240Hz OLED ROG Nebula display.',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
  2199.00,
  1780.00,
  10,
  1,
  NOW(),
  NOW()
),
(
  4,
  'iPhone 16 Pro Max 256GB (Natural Titanium)',
  2,
  1,
  5,
  'IPH16-PM-256-NT',
  '195949654321',
  'A18 Pro chip, 6.9" Super Retina XDR display with ProMotion, 48MP Fusion camera system with 5x telephoto optical zoom.',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  1199.00,
  990.00,
  35,
  1,
  NOW(),
  NOW()
),
(
  5,
  'Samsung Galaxy S24 Ultra 512GB (Titanium Gray)',
  2,
  2,
  6,
  'SGS24-ULTRA-512',
  '880609123456',
  'Snapdragon 8 Gen 3 for Galaxy, Galaxy AI features, built-in S Pen, 200MP camera with Quad Telephoto zoom.',
  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
  1299.00,
  1040.00,
  28,
  1,
  NOW(),
  NOW()
),
(
  6,
  'Samsung Galaxy Z Fold 6 256GB (Phantom Black)',
  2,
  2,
  5,
  'SGZF6-256-BLK',
  '880609654321',
  'Dual dynamic AMOLED 2X displays, ultra-slim hinge design, water resistant IP48, ultimate mobile multitasking.',
  'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
  1799.00,
  1470.00,
  12,
  1,
  NOW(),
  NOW()
),
(
  7,
  'iPad Pro 11" M4 (256GB, Wi-Fi, Space Black)',
  3,
  1,
  5,
  'IPAD-PRO-M4-11',
  '195949789012',
  'Breakthrough ultra-thin design, M4 silicon chip, Tandem OLED Ultra Retina XDR display, Apple Pencil Pro support.',
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
  999.00,
  820.00,
  22,
  1,
  NOW(),
  NOW()
),
(
  8,
  'Samsung Galaxy Tab S9 Ultra (14.6", 512GB)',
  3,
  2,
  6,
  'TAB-S9U-512-WIFI',
  '880609789012',
  'Giant 14.6" Dynamic AMOLED 2X 120Hz screen, IP68 water resistance, S Pen included in box, quad AKG speakers.',
  'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
  1199.00,
  960.00,
  16,
  1,
  NOW(),
  NOW()
),
(
  9,
  'Sony WH-1000XM5 Wireless ANC Headphones',
  4,
  5,
  8,
  'SONY-WH1000XM5-B',
  '454873612345',
  'Industry-leading active noise canceling with 8 microphones, Auto NC Optimizer, 30-hour battery life with quick charge.',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  399.00,
  295.00,
  45,
  1,
  NOW(),
  NOW()
),
(
  10,
  'Apple AirPods Pro 2 (USB-C MagSafe Case)',
  4,
  1,
  9,
  'AIRPODS-PRO2-USBC',
  '195949345678',
  'Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio.',
  'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
  249.00,
  188.00,
  65,
  1,
  NOW(),
  NOW()
),
(
  11,
  'Logitech MX Master 3S Wireless Performance Mouse',
  5,
  6,
  11,
  'LOGI-MXM3S-GRAPH',
  '097855123456',
  '8K DPI any-surface tracking sensor, Quiet Clicks, MagSpeed electromagnetic scrolling wheel, multi-device flow.',
  'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
  99.00,
  68.00,
  60,
  1,
  NOW(),
  NOW()
),
(
  12,
  'Logitech MX Mechanical Wireless Keyboard',
  5,
  6,
  11,
  'LOGI-MXMECH-TACT',
  '097855654321',
  'Low-profile tactile quiet mechanical switches, smart illumination backlighting, dual Bluetooth & Logi Bolt connection.',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
  169.00,
  118.00,
  40,
  1,
  NOW(),
  NOW()
),
(
  13,
  'Apple Watch Series 10 (46mm, Jet Black Aluminum)',
  6,
  1,
  12,
  'AW-S10-46MM-BLK',
  '195949987654',
  'Largest display yet with wide-angle OLED, sleep apnea detection, water temperature & depth sensor for snorkeling.',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  429.00,
  335.00,
  30,
  1,
  NOW(),
  NOW()
),
(
  14,
  'Samsung Galaxy Watch 7 (44mm, Bluetooth, Green)',
  6,
  2,
  12,
  'GW-7-44MM-GRN',
  '880609987654',
  'BioActive Sensor 2, dual-frequency GPS, Energy Score powered by Galaxy AI, sapphire crystal glass display.',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
  329.00,
  255.00,
  25,
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `product_name` = VALUES(`product_name`),
  `category_id` = VALUES(`category_id`),
  `brand_id` = VALUES(`brand_id`),
  `attribute_id` = VALUES(`attribute_id`),
  `barcode` = VALUES(`barcode`),
  `description` = VALUES(`description`),
  `image` = VALUES(`image`),
  `price` = VALUES(`price`),
  `cost` = VALUES(`cost`),
  `quantity_stock` = VALUES(`quantity_stock`),
  `active` = VALUES(`active`),
  `updated_date` = NOW();

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification Queries
SELECT 'Categories Count' AS Entity, COUNT(*) AS Total FROM `tbl_category`
UNION ALL
SELECT 'Brands Count', COUNT(*) FROM `tbl_brand`
UNION ALL
SELECT 'Attributes Count', COUNT(*) FROM `tbl_attribute`
UNION ALL
SELECT 'Products Count', COUNT(*) FROM `tbl_product_master`;
