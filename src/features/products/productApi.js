import api from "../../utils/axios";

export const productApi = {
  getAll: (params) => api.get("/products", { params }),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getById: (id) => api.get(`/products/${id}`),
};
