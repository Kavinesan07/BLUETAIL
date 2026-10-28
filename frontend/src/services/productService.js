import { api } from "./api";

export const productService = {
  list: () => api.get("/products"),
  get: (id) => api.get(`/products/${id}`),
  // formData contains: name, price, category, stock, description, image (file)
  create: (formData) => api.post("/products", formData),
  remove: (id) => api.delete(`/products/${id}`),
};

export const CATEGORIES = [
  "cars",
  "playstation",
  "books and comics",
  "jeserys",
  "anime",
];

export const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);