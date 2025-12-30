import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Cart from "./pages/ShoppingCart";
import ProductOverview from "./components/ProductOverview";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import CheckOut from "./pages/CheckOut";
import Payment from "./pages/Payment";
import Register from "./pages/Register";
import ProductPage from "./pages/ProductPage";
import Search from "./pages/Search";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AddBrands from "./pages/admin/AddBrands";
import AddCategories from "./pages/admin/AddCategories";
import AddProduct from "./pages/admin/AddProduct";
import AdminUserCarts from "./pages/admin/AdminUserCarts";

function App() {
  const { user, role, loading } = useAuth();

  if (loading) return <p className="text-center p-10">Loading...</p>;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/shoppingcart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/productoverview" element={<ProductOverview />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/new-in" element={<ProductPage />} />
        <Route path="/category/:id" element={<ProductPage />} />
        <Route path="/products/:slug" element={<ProductOverview />} />
        <Route path="/search" element={<Search />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/brands" element={<AddBrands />} />
        <Route path="/admin/categories" element={<AddCategories />} />
        <Route path="/admin/product" element={<AddProduct />} />
        <Route path="/admin/usercart" element={<AdminUserCarts />} />
      </Routes>
    </Router>
  );
}

export default App;
