import { api } from "./api";

export const authService = {
  login: (email, password) => api.post("/users/login", { email, password }),
  register: (username, email, password) =>
    api.post("/users/create", { username, email, password }),
};
