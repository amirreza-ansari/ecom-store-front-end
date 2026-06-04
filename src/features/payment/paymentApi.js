import api from "../../utils/axios";

export const paymentApi = {
  createPayment: (data) => api.post("/payments/create", data),
  processPayment: (data) => api.post("/payments/process", data),
  getStatus: (orderId) => api.get(`/payments/order/${orderId}`),
};
