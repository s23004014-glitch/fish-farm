import { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import MoreFish from "./pages/MoreFish.jsx";
import FishDetails from "./pages/FishDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import BuyerPanel from "./pages/BuyerPanel.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";

// Go to the top of the page every time the page changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Shown when the address does not exist
function NotFound() {
  return (
    <div className="page-container text-center">
      <h1 className="section-title">404</h1>
      <p className="mt-3 text-white/70">This page swam away.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  // The Home page has a full-screen hero video under the navbar.
  // Other pages need space at the top so the navbar does not cover them.
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />

      <main className={`flex-1 ${isHome ? "" : "pt-20"}`}>
        <Routes>
          {/* Open to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/fish" element={<MoreFish />} />
          <Route path="/fish/:id" element={<FishDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Buyers only */}
          <Route path="/cart" element={<ProtectedRoute role="buyer"><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute role="buyer"><Checkout /></ProtectedRoute>} />
          <Route path="/payment/result" element={<ProtectedRoute role="buyer"><PaymentResult /></ProtectedRoute>} />
          <Route path="/buyer" element={<ProtectedRoute role="buyer"><BuyerPanel /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}