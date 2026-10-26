import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { CATEGORIES, productService } from "../services/productService";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: CATEGORIES[0],
    description: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(e) {
    const picked = e.target.files[0];
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      setErrors((x) => ({ ...x, image: "Please choose an image file." }));
      return;
    }
    if (picked.size > 2 * 1024 * 1024) {
      setErrors((x) => ({ ...x, image: "Image must be smaller than 2 MB." }));
      return;
    }
    setErrors((x) => ({ ...x, image: "" }));
    setFile(picked);
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a product name.";
    if (!(Number(form.price) > 0)) next.price = "Enter a price above 0.";
    if (!(Number(form.stock) >= 0) || form.stock === "") next.stock = "Enter the stock count.";
    if (!file) next.image = "Choose a product image.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("category", form.category);
    data.append("description", form.description.trim());
    data.append("image", file);

    setLoading(true);
    try {
      const created = await productService.create(data);
      navigate(`/product/${created.id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <form className="form wide-form" onSubmit={handleSubmit} noValidate>
          <h1>Add a product</h1>
          <p className="hint">Fill in the details and upload a picture.</p>

          {serverError && <div className="error" role="alert">{serverError}</div>}

          <FormField id="name" name="name" label="Product name" value={form.name}
            onChange={handleChange} error={errors.name} />

          <div className="row-2">
            <FormField id="price" name="price" type="number" min="0" step="0.01"
              label="Price (₹)" value={form.price} onChange={handleChange} error={errors.price} />
            <FormField id="stock" name="stock" type="number" min="0"
              label="Stock" value={form.stock} onChange={handleChange} error={errors.stock} />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="4"
              value={form.description} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="image">Image (JPG/PNG, max 2 MB)</label>
            <input id="image" type="file" accept="image/*" onChange={handleFile}
              aria-invalid={!!errors.image} />
            {errors.image && <span className="field-error">{errors.image}</span>}
            {preview && <img className="preview" src={preview} alt="Preview" />}
          </div>

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save product"}
          </button>
        </form>
      </main>
    </div>
  );
}