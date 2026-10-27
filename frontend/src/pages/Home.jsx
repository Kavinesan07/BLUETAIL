import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, productService } from "../services/productService";
import Login from "./Login";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  
  useEffect(() => {
    productService
      .list()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, search, category]);

  return (
    <div className="app-shell">
      <Navbar />

      <section className="hero">
        <h1>welcome to winter and summer </h1>
        <input
          className="search"
          type="search"
          placeholder="something waiting for you .... "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
      </section>

      <main className="content wide">
        <div className="chips">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="hint">Loading products...</p>}
        {error && <div className="error" role="alert">{error}</div>}

        {!loading && !error && visible.length === 0 && (
          <div className="empty">
            <h2>No products found</h2>
            <p>Try a different search or category.</p>
          </div>
        )}

        <div className="grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>

    </div>
  );
}