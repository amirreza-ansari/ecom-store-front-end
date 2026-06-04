import api from "../../utils/axios";

export const userApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  updatePassword: (data) => api.put("/users/update-password", data),
};
