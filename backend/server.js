const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const supabase = require("./supabase");
const { getOrderStatus, setOrderStatus } = require("./orderStatusStore");
const { generateInvoice, getInvoiceNumber } = require("./generateInvoice");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Helper function to check admin status by user
async function isUserAdmin(user) {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  if (email.includes("admin") || email === "melvin@wellfit.com") return true;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.is_admin === true;
  } catch (err) {
    return false;
  }
}

// Helper to extract order ID from any parameter or URL string
function extractOrderIdFromRequest(req) {
  if (req.params && req.params.id) return req.params.id;
  if (req.query && req.query.id) return req.query.id;
  if (req.query && req.query.orderId) return req.query.orderId;

  const fullUrl = `${req.originalUrl || ""} ${req.url || ""} ${req.headers["x-invoke-path"] || ""} ${req.headers["x-matched-path"] || ""}`;

  const queryMatch = fullUrl.match(/[?&](?:id|orderId)=([^&\s]+)/i);
  if (queryMatch && queryMatch[1]) {
    return decodeURIComponent(queryMatch[1]);
  }

  const pathMatch = fullUrl.match(/(?:orders|invoice)\/([^\/\?\s]+)/i);
  if (pathMatch && pathMatch[1] && pathMatch[1] !== "invoice" && pathMatch[1] !== "index.js") {
    return decodeURIComponent(pathMatch[1]);
  }

  return null;
}

// INVOICE PDF DOWNLOAD HANDLER
async function handleInvoiceDownload(req, res) {
  try {
    const authHeader = req.headers.authorization;
    let accessToken = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.split(" ")[1];
    } else if (req.query && (req.query.token || req.query.accessToken)) {
      accessToken = req.query.token || req.query.accessToken;
    }

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

    const id = extractOrderIdFromRequest(req);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }
    const numId = parseInt(id, 10);

    // Fetch order with items by ID directly
    let query = supabase.from("orders").select(`
      *,
      order_items (*)
    `);

    if (!isNaN(numId)) {
      query = query.eq("id", numId);
    } else {
      query = query.eq("id", id);
    }

    const { data: order, error: orderError } = await query.maybeSingle();

    if (orderError || !order) {
      console.error("INVOICE FETCH ERROR:", orderError || "Order not found for ID " + id);
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found`,
      });
    }

    // Ownership check: owner or admin
    const isAdmin = await isUserAdmin(user);
    const userEmail = (user.email || "").toLowerCase().trim();
    const orderEmail = (order.email || "").toLowerCase().trim();
    const isOwner =
      order.user_id === user.id ||
      (userEmail !== "" && orderEmail !== "" && userEmail === orderEmail);

    const isAllowed = isAdmin || isOwner;

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only download invoices for your own orders.",
      });
    }

    // Resolve status
    const status = order.status || getOrderStatus(order.id);

    // Generate the invoice PDF
    const invoiceNumber = getInvoiceNumber(order.id);
    const pdfDoc = generateInvoice(order, order.order_items, status);

    // Buffer the PDF fully before sending — required for Vercel serverless
    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoice-${invoiceNumber}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.status(200).send(pdfBuffer);
    });
    pdfDoc.on("error", (err) => {
      console.error("PDF STREAM ERROR:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to generate invoice PDF",
        });
      }
    });
  } catch (error) {
    console.error("INVOICE GENERATION ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate invoice",
      });
    }
  }
}

// URL Normalizer for Vercel Serverless Function rewrites (MUST run before route matching)
app.use((req, res, next) => {
  if (req.url.includes("index.js")) {
    const qIdx = req.url.indexOf("?");
    if (qIdx !== -1) {
      const queryString = req.url.substring(qIdx + 1);
      const params = new URLSearchParams(queryString);
      const captured = params.get("1") || params.get("0") || params.get("path");
      if (captured) {
        let cleanPath = decodeURIComponent(captured).replace(/^\//, "");
        let embeddedQuery = "";
        const subQIdx = cleanPath.indexOf("?");
        if (subQIdx !== -1) {
          embeddedQuery = cleanPath.substring(subQIdx + 1);
          cleanPath = cleanPath.substring(0, subQIdx);
        }

        if (cleanPath.startsWith("api/")) {
          cleanPath = cleanPath.substring(4);
        }

        params.delete("1");
        params.delete("0");
        params.delete("path");

        const combinedParams = new URLSearchParams(embeddedQuery);
        params.forEach((v, k) => combinedParams.set(k, v));

        const finalQueryStr = combinedParams.toString();
        req.url = "/api/" + cleanPath + (finalQueryStr ? "?" + finalQueryStr : "");

        req.query = {};
        combinedParams.forEach((v, k) => {
          req.query[k] = v;
        });
      }
    }
  }

  if (!req.url.startsWith("/api") && !req.url.startsWith("/uploads")) {
    req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
  }
  next();
});

// INVOICE TOP-PRIORITY INTERCEPTOR
app.use(async (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const rawUrl = `${req.originalUrl || ""} ${req.url || ""} ${req.headers["x-invoke-path"] || ""}`;
  if (
    rawUrl.includes("invoice") ||
    (req.query && (req.query.invoice !== undefined || req.query.download !== undefined))
  ) {
    const match = rawUrl.match(/orders\/([^\/\?]+)\/invoice/i);
    if (match && match[1]) {
      req.params = req.params || {};
      req.params.id = match[1];
    }

    try {
      await handleInvoiceDownload(req, res);
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: err.message || "Failed to generate invoice PDF",
        });
      }
    }
    return; // NEVER CALL next() SO IT NEVER FALLS THROUGH TO GET /api/orders!
  }
  next();
});

// Serve uploaded images statically (safely guarded for serverless environments)
const uploadsDir = path.join(__dirname, "uploads");
if (!process.env.VERCEL) {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use("/uploads", express.static(uploadsDir));
  } catch (e) {
    console.warn("Uploads directory setup skipped:", e.message);
  }
}

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

app.get(["/", "/api", "/api/"], (req, res) => {
  res.json({
    success: true,
    message: "WellFit backend API is running successfully!",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      orders: "/api/orders",
      adminOrders: "/api/admin/orders",
      adminStats: "/api/admin/stats"
    }
  });
});

app.get(["/api/debug-routes", "/debug-routes"], (req, res) => {
  res.json({
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    routes: app._router.stack
      .filter((r) => r.route)
      .map((r) => ({ path: r.route.path, methods: r.route.methods })),
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

    // Persist status directly in Supabase orders table
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

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

// DEDICATED INVOICE ENDPOINTS
app.get("/api/invoice", handleInvoiceDownload);
app.get("/api/orders/:id/invoice", handleInvoiceDownload);
app.get("/api/orders/invoice", handleInvoiceDownload);

// CUSTOMER ORDERS ENDPOINTS
app.get("/api/orders", async (req, res) => {
  try {
    const extractedId = extractOrderIdFromRequest(req);
    const hasInvoiceQuery =
      req.query?.invoice !== undefined ||
      req.query?.download !== undefined ||
      (req.originalUrl || "").includes("invoice") ||
      (req.url || "").includes("invoice");

    if (extractedId || hasInvoiceQuery) {
      return handleInvoiceDownload(req, res);
    }

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

// IMAGE UPLOAD ENDPOINT (Base64 Data URL)
app.post("/api/upload", async (req, res) => {
  try {
    const adminCheck = await verifyAdmin(req);
    if (!adminCheck.isAdmin) {
      return res.status(adminCheck.status || 403).json({
        success: false,
        message: adminCheck.error,
      });
    }

    const { imageData } = req.body || {};

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "No image data provided",
      });
    }

    // Support base64 Data URLs and external URLs for Vercel live serverless compatibility
    if (
      typeof imageData === "string" &&
      (imageData.startsWith("data:image/") ||
        imageData.startsWith("http://") ||
        imageData.startsWith("https://"))
    ) {
      // Optional disk save for local development only
      if (!process.env.VERCEL) {
        try {
          const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
          if (base64Match) {
            const ext = base64Match[1];
            const base64Data = base64Match[2];
            const buffer = Buffer.from(base64Data, "base64");
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
            const filePath = path.join(uploadsDir, uniqueName);
            fs.writeFileSync(filePath, buffer);
          }
        } catch (e) {
          console.warn("Local disk save skipped:", e.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Image processed successfully",
        imageUrl: imageData,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid image format. Please upload a valid image file.",
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process image upload",
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

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`WellFit backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;