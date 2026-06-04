import api from "../../utils/axios";

export const reviewApi = {
  getByProduct: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),
  create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => api.put(`/reviews/${reviewId}/helpful`),
};
