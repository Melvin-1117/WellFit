import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Orders.css";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

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
        <span className="cancelled-icon">✕</span>
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
                {isCompleted ? "✓" : idx + 1}
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
              </div>

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