import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../services/productService";
import { orderService } from "../services/ordersservice";


function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const address = location.state?.address;
  const isCheckout = location.state?.checkout === true;

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isCheckout) {
      try {
        const savedCart = JSON.parse(
          localStorage.getItem("cart") || "[]"
        );

        setCart(savedCart);
      } catch {
        setError("Unable to load your cart.");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (!user?.id) {
      setLoading(false);
      return;
    }

    orderService
      .list(user.id)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isCheckout, user?.id]);

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  async function handleProceedToPayment() {
    if (!user?.id) {
      setError("Please log in before placing your order.");
      return;
    }

    if (!address?.id) {
      setError("Please provide a valid delivery address.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setCreatingOrder(true);
    setError("");

    try {
      // Create the order and its order items in the backend.
      const order = await orderService.create({
        address_id: address.id,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
        })),
      });

      const orderId = order.id ?? order.order?.id;

      if (orderId == null) {
        throw new Error("The server did not return an order ID.");
      }

      // Navigate only after the order has been created successfully.
      navigate("/payment", {
        state: {
          orderId,
          address,
          order,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to create your order."
      );
    } finally {
      setCreatingOrder(false);
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="content">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="content wide">
        {isCheckout ? (
          <>
            <h1>Review your order</h1>

            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            {/* Delivery address */}
            <section className="order-card">
              <h2>Delivery address</h2>

              {address ? (
                <>
                  <p><strong>{address.name}</strong></p>
                  <p>{address.phone_number}</p>
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} - {address.pin_code}
                  </p>
                </>
              ) : (
                <p>No delivery address was provided.</p>
              )}

              <Link to="/address">Change address</Link>
            </section>

            {/* Cart products */}
            <section className="order-card">
              <h2>Order items</h2>

              {cart.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                <ul className="order-items">
                  {cart.map((item) => (
                    <li
                      key={item.product_id}
                      className="order-item"
                    >
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>

                      <strong>
                        {formatPrice(
                          Number(item.price) *
                            Number(item.quantity)
                        )}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}

              <p className="summary-row">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </p>
            </section>

            <button
              className="primary"
              type="button"
              onClick={handleProceedToPayment}
              disabled={
                creatingOrder ||
                !address?.id ||
                cart.length === 0
              }
            >
              {creatingOrder
                ? "Creating order..."
                : "Proceed to Payment"}
            </button>
          </>
        ) : (
          <>
            <h1>My orders</h1>

            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            {!error && orders.length === 0 && (
              <div className="empty">
                <h2>No orders yet</h2>
                <p>
                  <Link to="/">Start shopping</Link>
                </p>
              </div>
            )}

            <div className="order-list">
              {orders.map((order) => (
                <article key={order.id} className="order-card">
                  <header className="order-head">
                    <div>
                      <strong>Order #{order.id}</strong>
                      <span className="order-date">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <span
                      className={`status-badge status-${order.status}`}
                    >
                      {order.status}
                    </span>
                  </header>

                  <ul className="order-items">
                    {(order.items || []).map((item) => (
                      <li
                        key={item.id ?? item.product_id}
                      >
                        <span>
                          {item.product_name} × {item.quantity}
                        </span>

                        <strong>
                          {formatPrice(
                            Number(item.unit_price) *
                              Number(item.quantity)
                          )}
                        </strong>
                      </li>
                    ))}
                  </ul>

                  <p className="summary-row">
                    <span>Total</span>
                    <strong>
                      {formatPrice(order.total_amount)}
                    </strong>
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}