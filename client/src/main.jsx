import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter lets us use pages and links */}
    <BrowserRouter>
      {/* Google login needs this wrapper */}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "not-set"}>
        {/* AuthProvider knows who is logged in. CartProvider needs it, so it is inside. */}
        <AuthProvider>
          <CartProvider>
            <App />
            {/* Small popup messages (success / error) */}
            <Toaster
              position="top-center"
              toastOptions={{ style: { background: "#0a1f44", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" } }}
            />
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);