import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-imaniglobal";

// Initialize Supabase Client
let supabase: ReturnType<typeof createClient> | null = null;

// Fallback in-memory database
let fallbackProducts = [
  {
    id: "1",
    name: "Premium Hardwood Charcoal",
    description: "High-quality, long-burning hardwood charcoal perfect for industrial and domestic use.",
    price: 450,
    image: "https://picsum.photos/seed/charcoal/600/400"
  },
  {
    id: "2",
    name: "Raw Cashew Nuts",
    description: "Sun-dried, premium quality raw cashew nuts sourced directly from the best farms.",
    price: 1200,
    image: "https://picsum.photos/seed/cashew/600/400"
  },
  {
    id: "3",
    name: "Unrefined Shea Butter",
    description: "100% pure, unrefined shea butter rich in vitamins A and E.",
    price: 300,
    image: "https://picsum.photos/seed/sheabutter/600/400"
  },
  {
    id: "4",
    name: "Fresh Cola Nuts",
    description: "Carefully selected fresh cola nuts with high caffeine content.",
    price: 150,
    image: "https://picsum.photos/seed/colanut/600/400"
  },
  {
    id: "5",
    name: "Dried Hibiscus Flower",
    description: "Vibrant, tart, and premium dried hibiscus flowers for teas and extracts.",
    price: 250,
    image: "https://picsum.photos/seed/hibiscus/600/400"
  }
];

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://dczoxzxxnsfxwzjfuhzq.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjem94enh4bnNmeHd6amZ1aHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQzMDUyNywiZXhwIjoyMDkyMDA2NTI3fQ.uYFLeAszyDB8MkGV6J4_L4T7ubv8mQSyRBjZbTMInaM";
    
    if (!supabaseKey) {
      return null;
    }
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

// Middleware to verify JWT
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const countryNames = [ "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

let shippingRates = countryNames.map((country, idx) => ({
  id: String(idx + 1),
  country: country,
  cargo: 150, // Base rate for 20kg
  shipping: 50 // Base rate for 20kg
}));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Orders
  let fallbackOrders: any[] = [];
  
  app.post("/api/orders", async (req, res) => {
    try {
      const db = getSupabase();
      const orderData = { ...req.body, created_at: new Date().toISOString() };
      
      if (!db) {
        orderData.id = Date.now().toString();
        fallbackOrders.push(orderData);
        return res.status(201).json(orderData);
      }

      const { data, error } = await (db as any).from("orders").insert([orderData]).select().single();
      if (error) {
         if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
            orderData.id = Date.now().toString();
            fallbackOrders.push(orderData);
            return res.status(201).json(orderData);
         }
         throw error;
      }
      res.status(201).json(data);
    } catch (err: any) {
      console.error("Error creating order:", err);
      res.status(500).json({ error: err.message || "Failed to create order" });
    }
  });

  app.get("/api/orders", authenticateAdmin, async (req, res) => {
    try {
      const db = getSupabase();
      if (!db) {
        return res.json(fallbackOrders);
      }
      const { data, error } = await (db as any).from("orders").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
          return res.json(fallbackOrders);
        }
        throw error;
      }
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      res.json(fallbackOrders);
    }
  });

  // Shipping Rates
  app.get("/api/shipping-rates", (req, res) => {
    res.json(shippingRates);
  });

  app.put("/api/shipping-rates", authenticateAdmin, (req, res) => {
    if (Array.isArray(req.body)) {
      shippingRates = req.body;
    }
    res.json(shippingRates);
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    // Hardcoded admin credentials for prototype
    if (email === "admin@imaniglobal.com" && password === "sammy1122") {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
      return res.json({ token });
    }
    return res.status(401).json({ error: "Invalid credentials" });
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const db = getSupabase();
      if (!db) {
        return res.json(fallbackProducts);
      }
      const { data, error } = await db.from("products").select("*").order("created_at", { ascending: true });
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
          console.warn("Supabase products table not found. Using local memory fallback.");
          return res.json(fallbackProducts);
        }
        console.error("Supabase GET error:", error);
        throw error;
      }
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      console.warn("Falling back to local products due to an error.");
      res.json(fallbackProducts);
    }
  });

  // Add a product (Admin only)
  app.post("/api/products", authenticateAdmin, async (req, res) => {
    try {
      const { name, description, price, image } = req.body;
      const db = getSupabase();
      
      if (!db) {
        const newProduct = {
          id: Date.now().toString(),
          name,
          description,
          price: Number(price),
          image: image || "https://picsum.photos/seed/agro/600/400"
        };
        fallbackProducts.push(newProduct);
        return res.status(201).json(newProduct);
      }

      const { data, error } = await (db as any).from("products").insert([
        {
          name,
          description,
          price: Number(price),
          image: image || "https://picsum.photos/seed/agro/600/400"
        }
      ]).select().single();
      
      if (error) {
         if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
            console.warn("Supabase products table not found during insert. Using local memory fallback.");
            const newProduct = {
              id: Date.now().toString(),
              name,
              description,
              price: Number(price),
              image: image || "https://picsum.photos/seed/agro/600/400"
            };
            fallbackProducts.push(newProduct);
            return res.status(201).json(newProduct);
         }
         throw error;
      }
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error adding product:", error);
      res.status(500).json({ error: error.message || "Failed to add product" });
    }
  });

  // Update a product (Admin only)
  app.put("/api/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, image } = req.body;
      const db = getSupabase();

      if (!db) {
        const index = fallbackProducts.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ error: "Product not found" });
        
        fallbackProducts[index] = {
          ...fallbackProducts[index],
          name: name || fallbackProducts[index].name,
          description: description || fallbackProducts[index].description,
          price: price ? Number(price) : fallbackProducts[index].price,
          image: image || fallbackProducts[index].image
        };
        return res.json(fallbackProducts[index]);
      }
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (price) updateData.price = Number(price);
      if (image) updateData.image = image;

      const { data, error } = await (db as any)
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
        
      if (error) {
         if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
            console.warn("Supabase products table not found during update. Using local memory fallback.");
            const index = fallbackProducts.findIndex(p => p.id === id);
            if (index === -1) return res.status(404).json({ error: "Product not found" });
            
            fallbackProducts[index] = {
              ...fallbackProducts[index],
              name: name || fallbackProducts[index].name,
              description: description || fallbackProducts[index].description,
              price: price ? Number(price) : fallbackProducts[index].price,
              image: image || fallbackProducts[index].image
            };
            return res.json(fallbackProducts[index]);
         }
         throw error;
      }
      res.json(data);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: error.message || "Failed to update product" });
    }
  });

  // Delete a product (Admin only)
  app.delete("/api/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const db = getSupabase();

      if (!db) {
        fallbackProducts = fallbackProducts.filter(p => p.id !== id);
        return res.json({ success: true });
      }

      const { error } = await db.from("products").delete().eq("id", id);
      
      if (error) {
         if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
             console.warn("Supabase products table not found during delete. Using local memory fallback.");
             fallbackProducts = fallbackProducts.filter(p => p.id !== id);
             return res.json({ success: true });
         }
         throw error;
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: error.message || "Failed to delete product" });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
