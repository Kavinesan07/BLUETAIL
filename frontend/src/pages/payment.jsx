import { useState } from "react";
import { Link, useLocation ,useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../services/productService";
import { orderService } from "../services/ordersservice";
import { paymentService } from "../services/paymentservice";


const METHODS = [
  { id: "cod", title: "Cash on Delivery", text: "Pay when the order arrives." },
  { id: "upi", title: "UPI", text: "Pay with your UPI ID." },
  { id: "card", title: "Card (demo)", text: "Credit or debit card. Demo form only." },
];

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function formatCardNumber(digits) {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function isExpired(expiry) {
  const [mm, yy] = expiry.split("/").map(Number);
  const now = new Date();
  const year = now.getFullYear() % 100;
  return yy < year || (yy === year && mm < now.getMonth() + 1);
}

export default function Payment() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const location = useLocation();
  const address = location.state?.address; // sent from the Address page (includes its id)

  const [method, setMethod] = useState("cod");
  const [form, setForm] = useState({
    upi_id: "",
    card_name: "",
    card_number: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null); // the order, once it is created
  const [paid, setPaid] = useState(null);   // the payment, after success

 

  function handleChange(e) {
    const { name } = e.target;
    let value = e.target.value;
    if (name === "card_number") value = value.replace(/\D/g, "").slice(0, 16);
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 3);
    if (name === "expiry") value = formatExpiry(value);
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const next = {};
    if (method === "upi") {
      if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(form.upi_id.trim())) {
        next.upi_id = "Enter a valid UPI ID, like name@bank.";
      }
    }
    if (method === "card") {
      if (form.card_name.trim().length < 2) next.card_name = "Enter the name on the card.";
      if (form.card_number.length !== 16) next.card_number = "Card number must be 16 digits.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) next.expiry = "Use MM/YY.";
      else if (isExpired(form.expiry)) next.expiry = "This card has expired.";
      if (form.cvv.length !== 3) next.cvv = "CVV must be 3 digits.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    debugger;
    e.preventDefault();
    setServerError("");
    if (!address) return;
    if (!address.id) {
      setServerError("The saved address has no id. Check what POST /address/create returns.");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Create the order once. If the payment fails and the user tries again,
      //    we reuse the same order instead of creating a second one.
      let current = order;
      if (!current) {
        current = await orderService.create({
          user_id: user.id,
          address_id: address.id,
          items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        });
        setOrder(current);
      }

      // 2. Pay for that order. The backend takes the amount from the order.
      //    Card and UPI details never leave the browser.
      const saved = await paymentService.create({ order_id: current.id, method });

      setPaid(saved);
      clear(); // empty the cart
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ---- Success screen ----
  if (paid) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="content">
          <div className="success-box">
            <h1>Order placed</h1>
            <p>Thank you, {user.username}.</p>
            <p className="success-line">
              Order #{paid.order_id} - {formatPrice(paid.amount)} -{" "}
              {paid.status === "paid" ? "Paid" : "Pay on delivery"}
            </p>
            <Link to="/orders" className="primary link-btn-block">View my orders</Link>
          </div>
        </main>
      </div>
    );
  }

  // ---- Empty cart ----
  if (items.length === 0) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="content wide">
          <div className="empty">
            <h2>Your cart is empty</h2>
            <p><Link to="/">Go and find a toy</Link></p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content wide">
        <h1>Payment</h1>

        <div className="cart-layout">
          <form className="form pay-form" onSubmit={handleSubmit} noValidate>
            {serverError && <div className="error" role="alert">{serverError}</div>}

            {address ? (
              <div className="address-box">
                <strong>Delivering to</strong>
                <p>
                  {address.name}, {address.phone}<br />
                  {address.street}, {address.city}, {address.state} - {address.pin_code}
                </p>
                <Link to="/address">Change address</Link>
              </div>
            ) : (
              <div className="error" role="alert">
                No delivery address selected. <Link to="/address">Add your address first</Link>
              </div>
            )}

            <h2>Choose a payment method</h2>
            <div className="method-list">
              {METHODS.map((m) => (
                <label key={m.id} className={`method ${method === m.id ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => { setMethod(m.id); setErrors({}); }}
                  />
                  <span>
                    <strong>{m.title}</strong>
                    <small>{m.text}</small>
                  </span>
                </label>
              ))}
            </div>

            {method === "upi" && (
              <FormField id="upi_id" name="upi_id" label="UPI ID" placeholder="name@bank"
                value={form.upi_id} onChange={handleChange} error={errors.upi_id} />
            )}

            {method === "card" && (
              <>
                <FormField id="card_name" name="card_name" label="Name on card" autoComplete="cc-name"
                  value={form.card_name} onChange={handleChange} error={errors.card_name} />
                <FormField id="card_number" name="card_number" label="Card number" inputMode="numeric"
                  autoComplete="cc-number" placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(form.card_number)} onChange={handleChange}
                  error={errors.card_number} />
                <div className="row-2">
                  <FormField id="expiry" name="expiry" label="Expiry (MM/YY)" inputMode="numeric"
                    autoComplete="cc-exp" placeholder="08/29"
                    value={form.expiry} onChange={handleChange} error={errors.expiry} />
                  <FormField id="cvv" name="cvv" label="CVV" type="password" inputMode="numeric"
                    autoComplete="cc-csc" value={form.cvv} onChange={handleChange} error={errors.cvv} />
                </div>
              </>
            )}

            {method !== "cod" && (
              <p className="demo-note">
                Demo mode: no real money is charged. These details are checked in your browser
                and are never sent to the server.
              </p>
            )}

            <button className="primary" type="submit" disabled={loading || !address}>
              {loading ? "Processing..." : method === "cod" ? "Place order" : `Pay ${formatPrice(total)}`}

            </button>
          </form>

          <aside className="summary">
            <h2>Order summary</h2>
            <ul className="pay-items">
              {items.map((i) => (
                <li key={i.id}>
                  <span>{i.name} x {i.qty}</span>
                  <strong>{formatPrice(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>
            <p className="summary-row"><span>Total</span><strong>{formatPrice(total)}</strong></p>
          </aside>
        </div>
      </main>
    </div>
  );
}