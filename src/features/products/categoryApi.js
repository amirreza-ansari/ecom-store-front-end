import api from "../../utils/axios";

export const categoryApi = {
  getAll: () => api.get("/categories"),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  getById: (id) => api.get(`/categories/${id}`),
};
