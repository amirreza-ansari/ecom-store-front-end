import { Routes, Route } from "react-router-dom";
import CustomerLayout from "./components/layout/CustomerLayout";
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
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/shop' element={<ShopPage />} />
        <Route path='/product/:slug' element={<ProductPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/orders' element={<OrderHistoryPage />} />
        <Route path='/orders/:id' element={<OrderDetailsPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/profile/addresses' element={<AddressPage />} />
      </Route>
    </Routes>
  );
}

export default App;
