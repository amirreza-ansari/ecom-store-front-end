import api from "../../utils/axios";

export const adminApi = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getRevenue: (period) => api.get(`/analytics/revenue?period=${period}`),
  getTopProducts: (limit = 5) =>
    api.get(`/analytics/top-products?limit=${limit}`),
  getTopCategories: (limit = 5) =>
    api.get(`/analytics/top-categories?limit=${limit}`),
  getRecentOrders: (limit = 5) =>
    api.get(`/analytics/recent-orders?limit=${limit}`),
};
