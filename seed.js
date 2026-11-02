/**
 * Database Seeder Script for Electronics POS System
 * Populates tbl_category, tbl_brand, tbl_attribute, and tbl_product_master
 * 
 * Domain: Electronics, Computers, Laptops, Smartphones, Tablets, Audio, & Accessories
 * 
 * Usage:
 *   cd node-api
 *   npm run seed
 *   # or: node seed.js
 */

const { sequelize, Category, Brand, Attribute, ProductMaster } = require("./src/models");

const categoriesData = [
  {
    category_id: 1,
    category_name: "Laptops & Computers",
    description: "MacBooks, Windows Ultrabooks, High-Performance Gaming Laptops, Desktop PCs",
    active: 1,
  },
  {
    category_id: 2,
    category_name: "Smartphones",
    description: "Flagship 5G Smartphones, Foldables, and Mobile Devices",
    active: 1,
  },
  {
    category_id: 3,
    category_name: "Tablets & iPads",
    description: "Pro Drawing Tablets, iPads, Android Tablets, and Stylus Pens",
    active: 1,
  },
  {
    category_id: 4,
    category_name: "Audio & Headphones",
    description: "Active Noise-Cancelling Headphones, True Wireless Earbuds, Studio Monitors",
    active: 1,
  },
  {
    category_id: 5,
    category_name: "Computer Accessories",
    description: "Mechanical Keyboards, Precision Mice, USB-C Hubs, Fast GaN Chargers",
    active: 1,
  },
  {
    category_id: 6,
    category_name: "Wearables & Smartwatches",
    description: "Fitness Trackers, Cellular Smartwatches, Health & Workout Bands",
    active: 1,
  },
];

const brandsData = [
  {
    brand_id: 1,
    brand_name: "Apple",
    description: "Pioneering technology devices including MacBook, iPhone, iPad, Apple Watch",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60",
    active: 1,
  },
  {
    brand_id: 2,
    brand_name: "Samsung",
    description: "World leader in Galaxy mobile smartphones, displays, tablets, and wearables",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60",
    active: 1,
  },
  {
    brand_id: 3,
    brand_name: "Dell",
    description: "Industry standard for enterprise and creator laptops, XPS line, and Alienware",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60",
    active: 1,
  },
  {
    brand_id: 4,
    brand_name: "ASUS",
    description: "Gaming laptops, ROG Zephyrus series, high-end PC hardware and monitors",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60",
    active: 1,
  },
  {
    brand_id: 5,
    brand_name: "Sony",
    description: "Pinnacle of personal audio engineering, noise cancellation, and PlayStation gear",
    image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60",
    active: 1,
  },
  {
    brand_id: 6,
    brand_name: "Logitech",
    description: "Leading manufacturer of productivity and esports mechanical keyboards and mice",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60",
    active: 1,
  },
];

const attributesData = [
  {
    attribute_id: 1,
    attribute_name: "Specs",
    attribute_value: "16GB Unified RAM / 512GB SSD",
    active: 1,
  },
  {
    attribute_id: 2,
    attribute_name: "Specs",
    attribute_value: "32GB RAM / 1TB NVMe SSD",
    active: 1,
  },
  {
    attribute_id: 3,
    attribute_name: "Specs",
    attribute_value: "8GB RAM / 256GB SSD",
    active: 1,
  },
  {
    attribute_id: 4,
    attribute_name: "Storage",
    attribute_value: "128GB Storage",
    active: 1,
  },
  {
    attribute_id: 5,
    attribute_name: "Storage",
    attribute_value: "256GB Storage",
    active: 1,
  },
  {
    attribute_id: 6,
    attribute_name: "Storage",
    attribute_value: "512GB Storage",
    active: 1,
  },
  {
    attribute_id: 7,
    attribute_name: "Storage",
    attribute_value: "1TB Ultra Storage",
    active: 1,
  },
  {
    attribute_id: 8,
    attribute_name: "Color",
    attribute_value: "Space Gray / Black",
    active: 1,
  },
  {
    attribute_id: 9,
    attribute_name: "Color",
    attribute_value: "Silver / White",
    active: 1,
  },
  {
    attribute_id: 10,
    attribute_name: "Connectivity",
    attribute_value: "Wi-Fi + 5G Cellular",
    active: 1,
  },
  {
    attribute_id: 11,
    attribute_name: "Connectivity",
    attribute_value: "Wireless Bluetooth 5.3 + 2.4GHz",
    active: 1,
  },
  {
    attribute_id: 12,
    attribute_name: "Size",
    attribute_value: "46mm Titanium",
    active: 1,
  },
];

const productsData = [
  {
    product_id: 1,
    product_name: "MacBook Pro 14\" (Apple M3 Pro)",
    category_id: 1,
    brand_id: 1,
    attribute_id: 1,
    sku: "MBP14-M3-512",
    barcode: "195949123456",
    description: "Apple M3 Pro chip with 11-core CPU and 14-core GPU, 14.2\" Liquid Retina XDR display, 18 hours battery life.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    price: 1999.00,
    cost: 1680.00,
    quantity_stock: 18,
    active: 1,
  },
  {
    product_id: 2,
    product_name: "Dell XPS 15 (Intel Core i7, OLED 3.5K)",
    category_id: 1,
    brand_id: 3,
    attribute_id: 2,
    sku: "DELL-XPS15-OLED",
    barcode: "884116345678",
    description: "13th Gen Intel Core i7-13700H, NVIDIA RTX 4060, stunning 15.6\" 3.5K OLED InfinityEdge touch display.",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    price: 1849.00,
    cost: 1490.00,
    quantity_stock: 14,
    active: 1,
  },
  {
    product_id: 3,
    product_name: "ASUS ROG Zephyrus G16 (RTX 4070)",
    category_id: 1,
    brand_id: 4,
    attribute_id: 2,
    sku: "ROG-G16-4070",
    barcode: "471108123456",
    description: "Ultra-slim gaming laptop with Intel Core Ultra 9, RTX 4070 GPU, 2.5K 240Hz OLED ROG Nebula display.",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
    price: 2199.00,
    cost: 1780.00,
    quantity_stock: 10,
    active: 1,
  },
  {
    product_id: 4,
    product_name: "iPhone 16 Pro Max 256GB (Natural Titanium)",
    category_id: 2,
    brand_id: 1,
    attribute_id: 5,
    sku: "IPH16-PM-256-NT",
    barcode: "195949654321",
    description: "A18 Pro chip, 6.9\" Super Retina XDR display with ProMotion, 48MP Fusion camera system with 5x telephoto optical zoom.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    price: 1199.00,
    cost: 990.00,
    quantity_stock: 35,
    active: 1,
  },
  {
    product_id: 5,
    product_name: "Samsung Galaxy S24 Ultra 512GB (Titanium Gray)",
    category_id: 2,
    brand_id: 2,
    attribute_id: 6,
    sku: "SGS24-ULTRA-512",
    barcode: "880609123456",
    description: "Snapdragon 8 Gen 3 for Galaxy, Galaxy AI features, built-in S Pen, 200MP camera with Quad Telephoto zoom.",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
    price: 1299.00,
    cost: 1040.00,
    quantity_stock: 28,
    active: 1,
  },
  {
    product_id: 6,
    product_name: "Samsung Galaxy Z Fold 6 256GB (Phantom Black)",
    category_id: 2,
    brand_id: 2,
    attribute_id: 5,
    sku: "SGZF6-256-BLK",
    barcode: "880609654321",
    description: "Dual dynamic AMOLED 2X displays, ultra-slim hinge design, water resistant IP48, ultimate mobile multitasking.",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
    price: 1799.00,
    cost: 1470.00,
    quantity_stock: 12,
    active: 1,
  },
  {
    product_id: 7,
    product_name: "iPad Pro 11\" M4 (256GB, Wi-Fi, Space Black)",
    category_id: 3,
    brand_id: 1,
    attribute_id: 5,
    sku: "IPAD-PRO-M4-11",
    barcode: "195949789012",
    description: "Breakthrough ultra-thin design, M4 silicon chip, Tandem OLED Ultra Retina XDR display, Apple Pencil Pro support.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
    price: 999.00,
    cost: 820.00,
    quantity_stock: 22,
    active: 1,
  },
  {
    product_id: 8,
    product_name: "Samsung Galaxy Tab S9 Ultra (14.6\", 512GB)",
    category_id: 3,
    brand_id: 2,
    attribute_id: 6,
    sku: "TAB-S9U-512-WIFI",
    barcode: "880609789012",
    description: "Giant 14.6\" Dynamic AMOLED 2X 120Hz screen, IP68 water resistance, S Pen included in box, quad AKG speakers.",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80",
    price: 1199.00,
    cost: 960.00,
    quantity_stock: 16,
    active: 1,
  },
  {
    product_id: 9,
    product_name: "Sony WH-1000XM5 Wireless ANC Headphones",
    category_id: 4,
    brand_id: 5,
    attribute_id: 8,
    sku: "SONY-WH1000XM5-B",
    barcode: "454873612345",
    description: "Industry-leading active noise canceling with 8 microphones, Auto NC Optimizer, 30-hour battery life with quick charge.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    price: 399.00,
    cost: 295.00,
    quantity_stock: 45,
    active: 1,
  },
  {
    product_id: 10,
    product_name: "Apple AirPods Pro 2 (USB-C MagSafe Case)",
    category_id: 4,
    brand_id: 1,
    attribute_id: 9,
    sku: "AIRPODS-PRO2-USBC",
    barcode: "195949345678",
    description: "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio.",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    price: 249.00,
    cost: 188.00,
    quantity_stock: 65,
    active: 1,
  },
  {
    product_id: 11,
    product_name: "Logitech MX Master 3S Wireless Performance Mouse",
    category_id: 5,
    brand_id: 6,
    attribute_id: 11,
    sku: "LOGI-MXM3S-GRAPH",
    barcode: "097855123456",
    description: "8K DPI any-surface tracking sensor, Quiet Clicks, MagSpeed electromagnetic scrolling wheel, multi-device flow.",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    price: 99.00,
    cost: 68.00,
    quantity_stock: 60,
    active: 1,
  },
  {
    product_id: 12,
    product_name: "Logitech MX Mechanical Wireless Keyboard",
    category_id: 5,
    brand_id: 6,
    attribute_id: 11,
    sku: "LOGI-MXMECH-TACT",
    barcode: "097855654321",
    description: "Low-profile tactile quiet mechanical switches, smart illumination backlighting, dual Bluetooth & Logi Bolt connection.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    price: 169.00,
    cost: 118.00,
    quantity_stock: 40,
    active: 1,
  },
  {
    product_id: 13,
    product_name: "Apple Watch Series 10 (46mm, Jet Black Aluminum)",
    category_id: 6,
    brand_id: 1,
    attribute_id: 12,
    sku: "AW-S10-46MM-BLK",
    barcode: "195949987654",
    description: "Largest display yet with wide-angle OLED, sleep apnea detection, water temperature & depth sensor for snorkeling.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    price: 429.00,
    cost: 335.00,
    quantity_stock: 30,
    active: 1,
  },
  {
    product_id: 14,
    product_name: "Samsung Galaxy Watch 7 (44mm, Bluetooth, Green)",
    category_id: 6,
    brand_id: 2,
    attribute_id: 12,
    sku: "GW-7-44MM-GRN",
    barcode: "880609987654",
    description: "BioActive Sensor 2, dual-frequency GPS, Energy Score powered by Galaxy AI, sapphire crystal glass display.",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
    price: 329.00,
    cost: 255.00,
    quantity_stock: 25,
    active: 1,
  },
];

async function seedElectronicsDatabase() {
  console.log("⚡ Starting Electronics POS database seeding process...");

  try {
    await sequelize.authenticate();
    console.log(" Connected to MySQL database successfully.");

    await sequelize.sync();
    console.log(" Database schema checked.");

    // Clean existing records cleanly to avoid mixing old records
    console.log("\n🧹 Refreshing existing records...");
    await ProductMaster.destroy({ where: {}, truncate: false });
    await Attribute.destroy({ where: {}, truncate: false });
    await Brand.destroy({ where: {}, truncate: false });
    await Category.destroy({ where: {}, truncate: false });
    console.log(" Previous records cleared.");

    // 1. Seed Categories
    console.log("\n📦 Seeding Electronics Categories...");
    for (const cat of categoriesData) {
      await Category.upsert(cat);
    }
    console.log(` Created ${categoriesData.length} categories.`);

    // 2. Seed Brands
    console.log("\n🏷️ Seeding Electronics Brands...");
    for (const br of brandsData) {
      await Brand.upsert(br);
    }
    console.log(` Created ${brandsData.length} brands.`);

    // 3. Seed Attributes
    console.log("\n🎨 Seeding Hardware Attributes...");
    for (const attr of attributesData) {
      await Attribute.upsert(attr);
    }
    console.log(` Created ${attributesData.length} attributes.`);

    // 4. Seed Product Masters
    console.log("\n💻 Seeding Electronics Products (Computers, Phones, Tablets, Audio, etc.)...");
    for (const prd of productsData) {
      await ProductMaster.upsert(prd);
    }
    console.log(` Created ${productsData.length} product master records.`);

    console.log("\n🎉 Electronics Database seeding completed successfully!");
    console.log("==================================================");
    console.log("Summary of Seeded Electronics Data:");
    console.log(`• Categories : ${categoriesData.length}`);
    console.log(`• Brands     : ${brandsData.length}`);
    console.log(`• Attributes : ${attributesData.length}`);
    console.log(`• Products   : ${productsData.length}`);
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("💥 Error during database seeding:", error);
    process.exit(1);
  }
}

seedElectronicsDatabase();
