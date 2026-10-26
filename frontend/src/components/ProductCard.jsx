import { Link } from "react-router-dom";
import { imageUrl } from "../services/api";
import { formatPrice } from "../services/productService";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

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
          className="primary small"
          disabled={outOfStock}
          onClick={() => addItem(product)}
        >
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}