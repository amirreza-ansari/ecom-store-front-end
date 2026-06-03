import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  discount: 0,
  shippingCost: 0,
  total: 0,
  coupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      const {
        items,
        subtotal,
        discount,
        shippingCost,
        total,
        totalItems,
        coupon,
      } = action.payload;
      state.items = items;
      state.subtotal = subtotal;
      state.discount = discount;
      state.shippingCost = shippingCost;
      state.total = total;
      state.totalItems = totalItems;
      state.coupon = coupon;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.discount = 0;
      state.shippingCost = 0;
      state.total = 0;
      state.coupon = null;
    },
  },
});

export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
