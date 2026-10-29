import { api } from "./api";

export const addressService = {
  create: (data) => api.post("/address/create", data),
};

export const paymentService = {
  create: (data) => api.post("/payments", data),
};