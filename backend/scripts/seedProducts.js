const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./backend/.env" });

const supabaseUrl = process.env.SUPABASE_URL || "https://zzbnaiwslpbndkwmmqlu.supabase.co";
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseSecretKey);

const productsData = [
  {
    id: 1,
    name: "Leather Biker Jacket",
    price: 3499,
    category: "men",
    image: "/products/men/item1.jpg",
    description: "Classic black leather biker jacket with premium zip detailing, soft inner lining, and a rugged modern finish.",
  },
  {
    id: 2,
    name: "Vintage Denim Shirt",
    price: 1899,
    category: "men",
    image: "/products/men/item2.jpg",
    description: "Washed vintage denim shirt crafted from 100% breathable cotton for effortless casual styling.",
  },
  {
    id: 3,
    name: "Urban Streetwear Hoodie",
    price: 2199,
    category: "men",
    image: "/products/men/item3.jpg",
    description: "Cozy fleece-lined urban hoodie featuring a relaxed drop-shoulder fit and front pouch pocket.",
  },
  {
    id: 4,
    name: "Tailored Navy Blazer",
    price: 4299,
    category: "men",
    image: "/products/men/item4.jpg",
    description: "Sophisticated single-breasted navy blazer designed for sharp formal events and elevated workwear.",
  },
  {
    id: 5,
    name: "Minimalist Polo Shirt",
    price: 1399,
    category: "men",
    image: "/products/men/item5.jpg",
    description: "Breathable piqué cotton polo shirt with structured collar and minimalist embroidered logo detail.",
  },
  {
    id: 6,
    name: "Casual Cotton Chinos",
    price: 1799,
    category: "men",
    image: "/products/men/item6.jpg",
    description: "Slim-fit stretch cotton chino trousers built for day-to-night comfort and versatility.",
  },
  {
    id: 7,
    name: "Summer Floral Maxi Dress",
    price: 2699,
    category: "women",
    image: "/products/women/item1.jpg",
    description: "Flowing tier-style summer maxi dress with vibrant floral motifs and a flattering cinched waistline.",
  },
  {
    id: 8,
    name: "Elegant Silk Blouse",
    price: 1999,
    category: "women",
    image: "/products/women/item2.jpg",
    description: "Lustrous mulberry silk blouse with subtle button closures and fluid drape.",
  },
  {
    id: 9,
    name: "Oversized Knit Sweater",
    price: 2199,
    category: "women",
    image: "/products/women/item3.jpg",
    description: "Chunky knit sweater with ribbed cuffs and hem, perfect for cozy layering in cool weather.",
  },
  {
    id: 10,
    name: "Classic Trench Coat",
    price: 4999,
    category: "women",
    image: "/products/women/item4.jpg",
    description: "Iconic double-breasted trench coat with waist belt, storm flap, and water-resistant finish.",
  },
  {
    id: 11,
    name: "Pleated Midi Skirt",
    price: 1799,
    category: "women",
    image: "/products/women/item5.jpg",
    description: "Elegant accordion pleated midi skirt featuring a comfortable elasticated waistband.",
  },
  {
    id: 12,
    name: "Designer Evening Gown",
    price: 5499,
    category: "women",
    image: "/products/women/item6.jpg",
    description: "Floor-length evening gown crafted with intricate embroidery and a graceful silhouette.",
  },
  {
    id: 13,
    name: "Playful Cotton Overalls",
    price: 1199,
    category: "kids",
    image: "/products/kids/item1.jpg",
    description: "Durable organic cotton denim overalls with adjustable shoulder straps and side pocket detail.",
  },
  {
    id: 14,
    name: "Bright Striped T-Shirt",
    price: 699,
    category: "kids",
    image: "/products/kids/item2.jpg",
    description: "Soft cotton jersey T-shirt with cheerful multicolored stripes for active playtimes.",
  },
  {
    id: 15,
    name: "Cozy Kids Winter Jacket",
    price: 1899,
    category: "kids",
    image: "/products/kids/item3.jpg",
    description: "Insulated padded winter jacket with cozy fleece lining and detachable hood.",
  },
  {
    id: 16,
    name: "Denim Outfit Set",
    price: 1499,
    category: "kids",
    image: "/products/kids/item4.jpg",
    description: "Matching 2-piece denim outfit set including button-up jacket and relaxed trousers.",
  },
  {
    id: 17,
    name: "Cute Summer Sundress",
    price: 999,
    category: "kids",
    image: "/products/kids/item5.jpg",
    description: "Lightweight cotton sundress featuring pretty ruffle sleeves and a cheerful flared hem.",
  },
  {
    id: 18,
    name: "Active Wear Set",
    price: 1299,
    category: "kids",
    image: "/products/kids/item6.jpg",
    description: "Breathable 2-piece activewear set with quick-dry fabric designed for high-energy activities.",
  },
];

async function seed() {
  console.log("Upserting all 18 seed products into Supabase...");

  const { data, error } = await supabase
    .from("products")
    .upsert(productsData, { onConflict: "id" })
    .select();

  if (error) {
    console.error("Failed to seed products:", error.message);
  } else {
    console.log(`Successfully seeded ${data ? data.length : 0} products into Supabase!`);
  }
}

seed();
