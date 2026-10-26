import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { imageUrl } from "../services/api";
import { formatPrice } from "../services/productService";

export default function Cart() {
  const { items, setQty, removeItem, clear, total } = useCart();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content wide">
        <h1>Your cart</h1>

        {items.length === 0 ? (
          <div className="empty">
            <h2>Your cart is empty</h2>
            <p><Link to="/">Go and find a toy car</Link></p>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-list">
              {items.map((i) => (
                <li key={i.id} className="cart-row">
                  <div className="cart-thumb">
                    {i.image_url ? (
                      <img src={imageUrl(i.image_url)} alt={i.name} />
                    ) : (
                      <span aria-hidden="true">🚗</span>
                    )}
                  </div>

                  <div className="cart-info">
                    <Link to={`/product/${i.id}`} className="card-title">{i.name}</Link>
                    <p className="price">{formatPrice(i.price)}</p>
                    <button className="link-danger" onClick={() => removeItem(i.id)}>Remove</button>
                  </div>

                  <div className="qty-box">
                    <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease">−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase">+</button>
                  </div>

                  <strong className="line-total">{formatPrice(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>

            <aside className="summary">
              <h2>Order summary</h2>
              <p className="summary-row"><span>Total</span><strong>{formatPrice(total)}</strong></p>
              <button
                className="primary"
                onClick={() => alert("Checkout is not connected yet. Next step: orders API.")}
              >
                Checkout
              </button>
              <button className="ghost dark" onClick={clear}>Clear cart</button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}