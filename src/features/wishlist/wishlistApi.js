import api from "../../utils/axios";

export const addToWishlist = (productId) =>
  api.post("/users/wishlist", { productId });
export const removeFromWishlist = (productId) =>
  api.delete(`/users/wishlist/${productId}`);
export const getWishlist = () => api.get("/users/wishlist");
