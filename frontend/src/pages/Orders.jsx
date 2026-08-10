import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Orders.css";

const API_URL = import.meta.env.VITE_API_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get the current logged-in session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("Please login to view your orders.");
        }

        // Send the access token to the backend
        const response = await fetch(
          `${API_URL}/api/orders`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch orders"
          );
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
          Loading Orders...
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
        <p className="orders-label">
          YOUR ACCOUNT
        </p>

        <h1>My Orders</h1>

        <p>
          View your previous orders and purchases.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h2>No Orders Yet</h2>

          <p>
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="orders-list">

          {orders.map((order) => (
            <div
              className="order-card"
              key={order.id}
            >

              <div className="order-card-header">

                <div>
                  <span>ORDER ID</span>

                  <strong>
                    #{order.id}
                  </strong>
                </div>

                <div>
                  <span>DATE</span>

                  <strong>
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
                  </strong>
                </div>

                <div>
                  <span>TOTAL</span>

                  <strong>
                    ₹{order.total}
                  </strong>
                </div>

              </div>

              <div className="order-items">

                {order.order_items?.map(
                  (item) => (
                    <div
                      className="order-item"
                      key={item.id}
                    >

                      <div>
                        <h3>
                          {item.product_name}
                        </h3>

                        <p>
                          Size: {item.size}
                        </p>

                        <p>
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {item.price *
                          item.quantity}
                      </strong>

                    </div>
                  )
                )}

              </div>

              <div className="order-status">
                <span>STATUS</span>

                <strong>
                  Order Placed
                </strong>
              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default Orders;