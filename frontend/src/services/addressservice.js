import { api } from "./api";

export const addressService = {
  create: (data) => api.post("/address/create", data),
};

