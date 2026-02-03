import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import { useCart } from "./context/CartContext";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
//import Register from "./pages/Register";

const Navbar = () => {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-blue-600"
            >
              <Store className="w-6 h-6" />
              Marketim
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
