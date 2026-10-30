
import { api } from "./api";


export const orderService = {
  list: async (userId) => {
    const response = await api.get(`/orders/my-orders`);
    return response.data;
  },

  getById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post("/orders/", payload);
    return response.data;
  },
};