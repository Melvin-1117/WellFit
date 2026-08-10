const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const supabase = require("./supabase");
const { getOrderStatus, setOrderStatus } = require("./orderStatusStore");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// URL Normalizer for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  if (!req.url.startsWith("/api") && !req.url.startsWith("/uploads")) {
    req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
  }
  next();
});

// Serve uploaded images statically
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Coupon definitions
const COUPONS = {
  WELLFIT10: { type: "percent", value: 10, description: "10% off your order" },
  WELCOME20: { type: "percent", value: 20, description: "20% off your order" },
  FLAT500: { type: "flat", value: 500, description: "₹500 off your order" },
};

// Metadata helpers for sizes & stock persistence in Supabase
function encodeProductMeta(descriptionText = "", sizes = ["S", "M", "L", "XL"], stock = 50) {
  const sizesStr = Array.isArray(sizes) ? sizes.join(",") : "S,M,L,XL";
  const cleanDesc = (descriptionText || "").replace(/\[META:.*?\]/g, "").trim();
  return `${cleanDesc} [META:sizes=${sizesStr};stock=${stock}]`;
}

function decodeProductMeta(fullDescription = "") {
  if (!fullDescription) {
    return {
      description: "Designed for comfort and everyday style.",
      sizes: ["S", "M", "L", "XL"],
      stock: 50,
    };
  }

  const metaMatch = fullDescription.match(/\[META:sizes=(.*?);stock=(.*?)\]/);
  let sizes = ["S", "M", "L", "XL"];
  let stock = 50;

  if (metaMatch) {
    if (metaMatch[1] !== undefined) {
      sizes = metaMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (metaMatch[2] !== undefined) {
      stock = parseInt(metaMatch[2], 10) || 50;
    }
  }

  const description = fullDescription.replace(/\[META:.*?\]/g, "").trim();

  return { description, sizes, stock };
}

// Helper function to format product objects for frontend
function formatProduct(p) {
  const meta = decodeProductMeta(p.description);

  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    category: p.category,
    image: p.image || p.image_url || "/products/men/item1.jpg",
    image_url: p.image_url || p.image || "/products/men/item1.jpg",
    description: meta.description || "Designed for comfort and everyday style.",
    sizes: p.sizes && Array.isArray(p.sizes) ? p.sizes : meta.sizes,
    stock: typeof p.stock === "number" ? p.stock : meta.stock,
    created_at: p.created_at,
  };
}

// Helper middleware/function to verify admin status
async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.body && req.body.accessToken) {
    token = req.body.accessToken;
  }

  if (!token) {
    return { isAdmin: false, error: "Authentication token required", status: 401 };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { isAdmin: false, error: "Invalid or expired session", status: 401 };
  }

  const isAdmin =
    user.user_metadata?.is_admin === true ||
    user.app_metadata?.is_admin === true ||
    user.email === "admin@wellfit.com";

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.is_admin === true) {
      return { isAdmin: true, user };
    }

    return {
      isAdmin: false,
      error: "Access denied. Admin rights required.",
      status: 403,
    };
  }

  return { isAdmin: true, user };
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WellFit backend is running",
  });
});

// AUTH PROFILE / ROLE CHECK
app.get("/api/auth/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    let isAdmin =
      user.user_metadata?.is_admin === true ||
      user.app_metadata?.is_admin === true ||
      user.email === "admin@wellfit.com";

    if (!isAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.is_admin === true) {
        isAdmin = true;
      }
    }

    res.json({
      success: true,
      user,
      isAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET PUBLIC PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabase.from("products").select("*").order("id", { ascending: true });

    if (category && category !== "all") {
      query = query.ilike("category", category.toLowerCase().trim());
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET PRODUCTS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const products = (data || []).map(formatProduct);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("PRODUCTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET PUBLIC SINGLE PRODUCT
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);

    let query = supabase.from("products").select("*");
    if (!isNaN(numId)) {
      query = query.eq("id", numId);
    } else {
      query = query.eq("id", id);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: formatProduct(data),
    });
  } catch (error) {
    console.error("GET PRODUCT DETAILS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE PRODUCT (ADMIN ONLY)
app.post("/api/products", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { name, price, category, image, image_url, description, sizes, stock } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required fields",
      });
    }

    // Compute next ID to avoid primary key sequence conflict
    const { data: maxRow } = await supabase
      .from("products")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextId = maxRow && typeof maxRow.id === "number" ? maxRow.id + 1 : 19;

    const encodedDescription = encodeProductMeta(
      description,
      sizes || ["S", "M", "L", "XL"],
      stock !== undefined ? Number(stock) : 50
    );

    const newProduct = {
      id: nextId,
      name,
      price: Number(price),
      category: category.toLowerCase(),
      image: image_url || image || "/products/men/item1.jpg",
      description: encodedDescription,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      console.error("POST PRODUCT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: formatProduct(data),
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE PRODUCT (ADMIN ONLY)
app.put("/api/products/:id", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { id } = req.params;
    const { name, price, category, image, image_url, description, sizes, stock } = req.body;

    const { data: existingProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    const existingMeta = existingProduct
      ? decodeProductMeta(existingProduct.description)
      : { description: "", sizes: ["S", "M", "L", "XL"], stock: 50 };

    const updatedDescText = description !== undefined ? description : existingMeta.description;
    const updatedSizes = sizes !== undefined ? sizes : existingMeta.sizes;
    const updatedStock = stock !== undefined ? Number(stock) : existingMeta.stock;

    const encodedDescription = encodeProductMeta(updatedDescText, updatedSizes, updatedStock);

    const updates = {
      description: encodedDescription,
    };

    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category.toLowerCase();
    if (image !== undefined || image_url !== undefined) {
      updates.image = image_url || image;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT PRODUCT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: formatProduct(data),
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE PRODUCT (ADMIN ONLY)
app.delete("/api/products/:id", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { id } = req.params;
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE PRODUCT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN GET ALL ORDERS
app.get("/api/admin/orders", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN ORDERS FETCH ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const orders = (data || []).map((o) => ({
      ...o,
      status: o.status || getOrderStatus(o.id),
    }));

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN UPDATE ORDER STATUS
app.put("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const previousStatus = getOrderStatus(id);
    const wasDelivered = previousStatus && previousStatus.toLowerCase() === "delivered";
    const isNowDelivered = status && status.toLowerCase() === "delivered";

    // Stock adjustment if status changed to/from Delivered
    if (!wasDelivered && isNowDelivered) {
      // Transitioning TO Delivered -> Reduce stock
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          if (!item.product_id) continue;
          const qty = Number(item.quantity) || 1;

          const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.product_id)
            .maybeSingle();

          if (product) {
            const meta = decodeProductMeta(product.description);
            const currentStock = typeof product.stock === "number" ? product.stock : meta.stock;
            const newStock = Math.max(0, currentStock - qty);

            const updatedDescription = encodeProductMeta(meta.description, meta.sizes, newStock);
            const updateFields = { description: updatedDescription };
            if (product.stock !== undefined) {
              updateFields.stock = newStock;
            }

            await supabase
              .from("products")
              .update(updateFields)
              .eq("id", product.id);
          }
        }
      }
    } else if (wasDelivered && !isNowDelivered) {
      // Transitioning FROM Delivered -> Restore stock
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          if (!item.product_id) continue;
          const qty = Number(item.quantity) || 1;

          const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.product_id)
            .maybeSingle();

          if (product) {
            const meta = decodeProductMeta(product.description);
            const currentStock = typeof product.stock === "number" ? product.stock : meta.stock;
            const newStock = currentStock + qty;

            const updatedDescription = encodeProductMeta(meta.description, meta.sizes, newStock);
            const updateFields = { description: updatedDescription };
            if (product.stock !== undefined) {
              updateFields.stock = newStock;
            }

            await supabase
              .from("products")
              .update(updateFields)
              .eq("id", product.id);
          }
        }
      }
    }

    setOrderStatus(id, status);

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: { id, status },
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN DASHBOARD STATS METRICS
app.get("/api/admin/stats", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { data: products } = await supabase.from("products").select("id");
    const { data: orders } = await supabase.from("orders").select("id, total");

    const totalProducts = products ? products.length : 0;
    const totalOrders = orders ? orders.length : 0;
    const totalRevenue = orders
      ? orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
      : 0;

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CUSTOMER ORDERS ENDPOINTS
app.get("/api/orders", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("ORDERS FETCH ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const orders = (data || []).map((o) => ({
      ...o,
      status: o.status || getOrderStatus(o.id),
    }));

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total, accessToken } = req.body;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
      });
    }

    // Server-side order deduplication (prevents double submits within 10 seconds)
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .eq("total", total)
      .gte("created_at", tenSecondsAgo)
      .order("created_at", { ascending: false });

    if (recentOrders && recentOrders.length > 0) {
      const existingOrder = recentOrders[0];
      return res.status(200).json({
        success: true,
        message: "Order placed successfully",
        order: { ...existingOrder, status: getOrderStatus(existingOrder.id) },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          customer_name: customer.name || customer.customer_name || user.email || "Customer",
          email: customer.email || user.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          city: customer.city || "",
          state: customer.state || "",
          pincode: customer.pincode || "",
          total: Number(total) || 0,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("ORDER INSERT ERROR:", orderError);
      return res.status(500).json({
        success: false,
        message: orderError.message,
      });
    }

    setOrderStatus(order.id, "Pending");

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name || item.product_name || "Product",
      size: item.size || "M",
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return res.status(500).json({
        success: false,
        message: itemsError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: { ...order, status: "Pending" },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
});

// IMAGE UPLOAD ENDPOINT (Base64)
app.post("/api/upload", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { imageData, fileName } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "No image data provided",
      });
    }

    // Extract base64 data (strip data:image/...;base64, prefix)
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Please upload a valid image file.",
      });
    }

    const ext = base64Match[1]; // png, jpg, jpeg, webp
    const base64Data = base64Match[2];
    const buffer = Buffer.from(base64Data, "base64");

    const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${uniqueName}`;

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// COUPON VALIDATION ENDPOINT
app.post("/api/coupons/validate", (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = COUPONS[code.toUpperCase().trim()];

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code. Please try a different code.",
      });
    }

    let discount = 0;
    const orderSubtotal = Number(subtotal) || 0;

    if (coupon.type === "percent") {
      discount = Math.round((orderSubtotal * coupon.value) / 100);
    } else if (coupon.type === "flat") {
      discount = Math.min(coupon.value, orderSubtotal);
    }

    const finalTotal = Math.max(orderSubtotal - discount, 0);

    res.json({
      success: true,
      coupon: {
        code: code.toUpperCase().trim(),
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        discount,
        finalTotal,
      },
    });
  } catch (error) {
    console.error("COUPON VALIDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`WellFit backend running on http://localhost:${PORT}`);
});

module.exports = app;