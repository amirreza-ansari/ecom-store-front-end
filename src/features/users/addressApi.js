import api from "../../utils/axios";

export const addressApi = {
  getAll: () => api.get("/users/addresses"),
  add: (data) => api.post("/users/addresses", data),
  update: (addressId, data) => api.put(`/users/addresses/${addressId}`, data),
  delete: (addressId) => api.delete(`/users/addresses/${addressId}`),
};
