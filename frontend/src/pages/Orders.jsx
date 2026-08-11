import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import "./Orders.css";

import { API_URL } from "../utils/apiConfig";

const ORDER_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

function getStepIndex(status) {
  if (!status) return 0;
  const idx = ORDER_STEPS.findIndex(
    (s) => s.toLowerCase() === status.toLowerCase()
  );
  return idx >= 0 ? idx : 0;
}

function OrderTracker({ status }) {
  const currentStep = getStepIndex(status);
  const isCancelled = status && status.toLowerCase() === "cancelled";

  if (isCancelled) {
    return (
      <div className="order-tracker-cancelled">
        <CancelOutlinedIcon style={{ fontSize: 20 }} />
        <span>Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="order-tracker">
      <div className="tracker-steps">
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={step}
              className={`tracker-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
            >
              <div className="tracker-dot">
                {isCompleted ? <CheckCircleOutlinedIcon style={{ fontSize: 16 }} /> : idx + 1}
              </div>
              <span className="tracker-label">{step}</span>
            </div>
          );
        })}
      </div>

      <div className="tracker-progress-bar">
        <div
          className="tracker-progress-fill"
          style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [invoiceError, setInvoiceError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("Please login to view your orders.");
        }

        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch orders");
        }

        setOrders(data.orders);
      } catch (error) {
        console.error("Orders error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoiceId(orderId);
      setInvoiceError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setInvoiceError({ id: orderId, message: "Please login to download invoice." });
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header, or generate one
      const disposition = response.headers.get("Content-Disposition");
      let filename = `invoice-INV-WF-${String(orderId).padStart(6, "0")}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download error:", err);
      setInvoiceError({ id: orderId, message: err.message || "Failed to download invoice" });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  if (loading) {
    return (
      <section className="orders-page">
        <div className="orders-loading">
          Loading Your Orders...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="orders-page">
        <div className="orders-error">
          <h2>Unable to Load Orders</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <div className="orders-header">
        <p className="orders-label">YOUR ACCOUNT</p>
        <h1>My Orders</h1>
        <p>View your previous orders and track delivery progress.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <span>ORDER ID</span>
                  <strong>#{order.id}</strong>
                </div>

                <div>
                  <span>DATE</span>
                  <strong>
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>

                <div>
                  <span>TOTAL</span>
                  <strong>₹{order.total}</strong>
                </div>

                <div className="order-card-header-actions">
                  <button
                    type="button"
                    className="btn-invoice"
                    disabled={downloadingInvoiceId === order.id}
                    onClick={() => handleDownloadInvoice(order.id)}
                  >
                    <FileDownloadOutlinedIcon style={{ fontSize: 16 }} />
                    {downloadingInvoiceId === order.id ? "Generating..." : "Download Invoice"}
                  </button>
                </div>
              </div>

              {invoiceError && invoiceError.id === order.id && (
                <div className="invoice-error">
                  {invoiceError.message}
                </div>
              )}

              <div className="order-items">
                {order.order_items?.map((item) => (
                  <div className="order-item" key={item.id}>
                    <div>
                      <h3>{item.product_name}</h3>
                      <p>Size: {item.size}</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>

                    <strong>
                      ₹{item.price * item.quantity}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-tracker-section">
                <OrderTracker status={order.status || "Pending"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;