import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import SplashScreen from "./components/SplashScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";

// Admin Imports
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen w-full">
    <Navbar />
    <CartDrawer />
    <main className="flex-grow w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <CartProvider>
      {!splashDone ? (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      ) : (
        <BrowserRouter>
          <Routes>
            {/* Public Storefront Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
            </Route>

            {/* Standalone Route for Checkout */}
            <Route path="/checkout" element={<Checkout />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </CartProvider>
  );
}
