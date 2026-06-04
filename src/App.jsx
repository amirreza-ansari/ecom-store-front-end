import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { setCart } from "./features/cart/cartSlice";
import { setWishlist } from "./features/wishlist/wishlistSlice";
import { getCart } from "./features/cart/cartApi";
import { getWishlist } from "./features/wishlist/wishlistApi";
import CustomerLayout from "./components/layout/CustomerLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import AddressPage from "./pages/AddressPage";

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Fetch cart and wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getCart()
        .then(({ data }) => {
          if (data.data?.cart) dispatch(setCart(data.data.cart));
        })
        .catch(() => {});

      getWishlist()
        .then(({ data }) => {
          if (data.data?.wishlist) {
            dispatch(setWishlist(data.data.wishlist.map((p) => p._id)));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/shop' element={<ShopPage />} />
        <Route path='/product/:slug' element={<ProductPage />} />
        <Route
          path='/cart'
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/wishlist'
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/checkout'
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/orders'
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/orders/:id'
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/addresses'
          element={
            <ProtectedRoute>
              <AddressPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
