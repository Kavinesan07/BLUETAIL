import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { imageUrl } from "../services/api";
import { formatPrice, productService } from "../services/productService";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    productService
      .get(id)
      .then(setProduct)
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      await productService.remove(product.id);
      removeItem(product.id);               // also remove it from the cart
      navigate("/", { replace: true });     // go back to the shop
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content wide">
        <Link to="/" className="back">← Back to shop</Link>

        {error && <div className="error" role="alert">{error}</div>}
        {!product && !error && <p className="hint">Loading...</p>}

        {product && (
          <div className="detail">
            <div className="detail-img">
              {product.image_url ? (
                <img src={imageUrl(product.image_url)} alt={product.name} />
              ) : (
                <span className="img-placeholder big" aria-hidden="true">🚗</span>
              )}
            </div>

            <div className="detail-info">
              <span className="tag">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="price big">{formatPrice(product.price)}</p>
              <p className="desc">{product.description || "No description yet."}</p>
              <p className={product.stock > 0 ? "in-stock" : "out-stock"}>
                {product.stock > 0 ? `In stock (${product.stock} left)` : "Out of stock"}
              </p>

              {product.stock > 0 && (
                <div className="buy-row">
                  <label htmlFor="qty">Qty</label>
                  <input
                    id="qty"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.min(product.stock, Math.max(1, Number(e.target.value) || 1)))
                    }
                  />
                 <button
  className="primary"
  onClick={() => {
    addItem(product, qty);
    navigate("/cart");
  }}
>
  Add to cart
</button>
                  <button
                    className="ghost dark"
                    onClick={() => {
                      addItem(product, qty);
                      navigate("/cart");
                    }}
                  >
                    Buy now
                  </button>
                </div>
              )}

              {isAuthenticated && (
                <button className="danger wide-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete this product"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}