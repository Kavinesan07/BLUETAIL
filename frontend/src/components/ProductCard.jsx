import { useState } from "react";
import { Link  , useNavigate } from "react-router-dom";
import { imageUrl } from "../services/api";
import { formatPrice, productService } from "../services/productService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ product, onDeleted }) {
  const { addItem, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const outOfStock = product.stock <= 0;


  async function handleDelete() {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      await productService.remove(product.id);
      removeItem(product.id);          // also remove it from the cart
      onDeleted?.(product.id);         // tell the page to remove the card
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  }

  return (
    <article className="card">
      <Link to={`/product/${product.id}`} className="card-img">
        {product.image_url ? (
          <img src={imageUrl(product.image_url)} alt={product.name} loading="lazy" />
        ) : (
          <span className="img-placeholder" aria-hidden="true">🚗</span>
        )}
      </Link>

      <div className="card-body">
        <span className="tag">{product.category}</span>
        <Link to={`/product/${product.id}`} className="card-title">{product.name}</Link>
        <p className="price">{formatPrice(product.price)}</p>
        <button
        type="button"
        className="primary small"
        disabled={outOfStock}
        onClick={() => {
          if (outOfStock) return;

          addItem(product);
          navigate("/cart");
        }}
      >
        {outOfStock ? "Out of stock" : "Add to cart"}
      </button>

        {isAuthenticated && (
          <button className="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </article>
  );
}