import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./Admin.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [toast, setToast] = useState(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch all admin data (Products, Orders, Stats)
  const fetchAdminData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      // 1. Fetch Products
      const resProducts = await fetch(`${API_URL}/api/products`);
      const dataProducts = await resProducts.json();
      if (dataProducts.success) {
        setProducts(dataProducts.products || []);
      }

      if (session?.access_token) {
        // 2. Fetch Orders (Admin)
        const resOrders = await fetch(`${API_URL}/api/admin/orders`, { headers });
        const dataOrders = await resOrders.json();
        if (dataOrders.success) {
          setOrders(dataOrders.orders || []);
        }

        // 3. Fetch Stats (Admin)
        const resStats = await fetch(`${API_URL}/api/admin/stats`, { headers });
        const dataStats = await resStats.json();
        if (dataStats.success && dataStats.stats) {
          setStats(dataStats.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      if (!silent) showToast("Error connecting to backend server", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Auto-refresh data every 8 seconds for real-time live sync
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Product Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteModalProduct) return;

    try {
      setDeleting(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Session expired. Please log in again.", "error");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/products/${deleteModalProduct.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        showToast("Product deleted successfully!", "success");
        setProducts((prev) => prev.filter((p) => p.id !== deleteModalProduct.id));
        fetchAdminData(true);
      } else {
        showToast(data.message || "Failed to delete product", "error");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      showToast("Server error deleting product", "error");
    } finally {
      setDeleting(false);
      setDeleteModalProduct(null);
    }
  };

  // Order Status Change Handler
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderStatus(orderId);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showToast("Session expired. Log in again.", "error");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        showToast(`Order #${orderId} status updated to "${newStatus}"`, "success");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        showToast(data.message || "Failed to update order status", "error");
      }
    } catch (err) {
      console.error("Update order status error:", err);
      showToast("Server error updating status", "error");
    } finally {
      setUpdatingOrderStatus(null);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === "all" ||
      (o.status || "Pending").toLowerCase() === orderStatusFilter.toLowerCase();
    const matchesSearch =
      (o.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(o.id).includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-page">
      {/* Top Header */}
      <div className="admin-header">
        <div className="admin-title-area">
          <p className="admin-label">ADMINISTRATION</p>
          <h1>Admin Control Center</h1>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => fetchAdminData()}
          >
            🔄 Refresh Data
          </button>

          <Link to="/admin/products/new" className="btn-admin-primary">
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-icon">📦</div>
          <div className="admin-metric-info">
            <h3>{stats.totalProducts || products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🛍️</div>
          <div className="admin-metric-info">
            <h3>{stats.totalOrders || orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">💰</div>
          <div className="admin-metric-info">
            <h3>₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : "0"}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <div className="admin-tab-group">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products Catalog ({products.length})
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Customer Orders ({orders.length})
          </button>
        </div>

        <span className="live-badge">🟢 Live Sync Active</span>
      </div>

      {/* Tab 1: Products Management */}
      {activeTab === "products" && (
        <>
          <div className="admin-controls">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="admin-filters">
              {["all", "men", "women", "kids"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`admin-filter-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#5483B3" }}>
              Loading products catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-table-container" style={{ padding: "60px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "18px", color: "#555", marginBottom: "16px" }}>
                No products found matching your search.
              </p>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img
                            src={product.image || product.image_url}
                            alt={product.name}
                            className="admin-product-thumb"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/60x80?text=No+Img";
                            }}
                          />
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                        </td>
                        <td>
                          <span className={`category-tag ${product.category}`}>
                            {product.category}
                          </span>
                        </td>
                        <td>
                          <strong>₹{product.price}</strong>
                        </td>
                        <td>
                          <span>{product.stock ?? 50} units</span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className="btn-action-edit"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="btn-action-delete"
                              onClick={() => setDeleteModalProduct(product)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="admin-mobile-cards">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="admin-mobile-card">
                    <img
                      src={product.image || product.image_url}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/70x90?text=No+Img";
                      }}
                    />
                    <div className="admin-mobile-card-info">
                      <h3>{product.name}</h3>
                      <span className={`category-tag ${product.category}`} style={{ alignSelf: "flex-start" }}>
                        {product.category}
                      </span>
                      <div className="admin-mobile-price">₹{product.price}</div>
                      <div className="admin-actions" style={{ marginTop: "8px" }}>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="btn-action-edit"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => setDeleteModalProduct(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Tab 2: Customer Orders Management */}
      {activeTab === "orders" && (
        <>
          <div className="admin-controls">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by customer name, email, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="admin-filters">
              {["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`admin-filter-btn ${orderStatusFilter === st ? "active" : ""}`}
                  onClick={() => setOrderStatusFilter(st)}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#5483B3" }}>
              Loading customer orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-table-container" style={{ padding: "60px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "18px", color: "#555" }}>
                No customer orders found.
              </p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{order.customer_name || "Customer"}</strong>
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{order.email}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          {order.city}, {order.state} ({order.pincode})
                        </div>
                      </td>
                      <td>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Today"}
                      </td>
                      <td>
                        {order.order_items && order.order_items.length > 0 ? (
                          <div style={{ fontSize: "13px" }}>
                            {order.order_items.map((item, idx) => (
                              <div key={idx}>
                                • {item.product_name} ({item.size}) x{item.quantity}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>1 item</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: "#052659" }}>₹{order.total}</strong>
                      </td>
                      <td>
                        <span className={`order-status-badge ${(order.status || "Pending").toLowerCase()}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <select
                          className="select-status"
                          value={order.status || "Pending"}
                          disabled={updatingOrderStatus === order.id}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteModalProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete <strong>"{deleteModalProduct.name}"</strong>?
              This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setDeleteModalProduct(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-action-delete"
                style={{ padding: "10px 20px", borderRadius: "24px" }}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
