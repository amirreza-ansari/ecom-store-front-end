import api from "../../utils/axios";

export const couponApi = {
  validateCoupon: (data) => api.post("/coupons/validate", data),
};
