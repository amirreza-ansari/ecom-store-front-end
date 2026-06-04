import { useEffect, useState } from "react";
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
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./features/admin/Dashboard";
import ProductManager from "./features/admin/ProductManager";

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(fetchCurrentUser()).finally(() => setAppReady(true));
    } else {
      setAppReady(true);
    }
  }, [dispatch]);

  // Fetch cart and wishlist when authenticated
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

  if (!appReady) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='w-8 h-8 border-2 border-[#D5D9D9] border-t-[#FF9900] rounded-full animate-spin' />
      </div>
    );
  }

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
      {/* Admin Routes */}
      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={<Dashboard />} />

        <Route path='products' element={<ProductManager />} />

        <Route
          path='categories'
          element={
            <div className='p-8'>
              <h1 className='text-2xl font-bold'>Categories</h1>
            </div>
          }
        />
        <Route
          path='orders'
          element={
            <div className='p-8'>
              <h1 className='text-2xl font-bold'>Orders</h1>
            </div>
          }
        />
        <Route
          path='users'
          element={
            <div className='p-8'>
              <h1 className='text-2xl font-bold'>Users</h1>
            </div>
          }
        />
        <Route
          path='coupons'
          element={
            <div className='p-8'>
              <h1 className='text-2xl font-bold'>Coupons</h1>
            </div>
          }
        />
        <Route
          path='inventory'
          element={
            <div className='p-8'>
              <h1 className='text-2xl font-bold'>Inventory</h1>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
