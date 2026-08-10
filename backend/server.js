const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "WellFit backend is running",
  });
});

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

    console.log("Fetching orders for user:", user.id);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("user_id", user.id)
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

    res.json({
      success: true,
      orders: data,
    });

  } catch (error) {
    console.error("ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(
      `WellFit backend running on http://localhost:${PORT}`
    );
  });
}

module.exports = app;

app.get("/api/orders", async (req, res) => {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // Verify the Supabase user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("AUTH ERROR:", userError);

      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    // Get orders belonging to this user
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("email", user.email)
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

    res.json({
      success: true,
      orders: data,
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
    const {
  customer,
  items,
  total,
  accessToken,
} = req.body;

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
    // Basic validation
    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
      });
    }

    // Create the order
    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .insert([
          {
  user_id: user.id,
  customer_name: customer.name,
  email: customer.email,
  phone: customer.phone,
  address: customer.address,
  city: customer.city,
  state: customer.state,
  pincode: customer.pincode,
  total: total,
},
        ])
        .select()
        .single();

    if (orderError) {
      return res.status(500).json({
        success: false,
        message: orderError.message,
      });
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } =
      await supabase
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
      order,
    });

  } catch (error) {

    console.error("Order error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
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

    res.json({
      success: true,
      orders: data,
    });

  } catch (error) {
    console.error("ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});