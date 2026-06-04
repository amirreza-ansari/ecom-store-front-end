import api from "../../utils/axios";

export const addToCart = (data) => api.post("/cart", data);
export const getCart = () => api.get("/cart");
export const updateCartItem = (itemId, data) =>
  api.put(`/cart/${itemId}`, data);
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);
export const clearCart = () => api.delete("/cart");
export const applyCoupon = (data) => api.post("/cart/coupon", data);
export const removeCoupon = () => api.delete("/cart/coupon");
