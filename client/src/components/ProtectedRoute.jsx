import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

// Usage: <ProtectedRoute role="buyer"> ... </ProtectedRoute>
// This only hides the page. The real protection is on the backend.
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until we know if someone is logged in
  if (loading) return <Spinner />;

  // Not logged in: go to the login page (and come back after login)
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // Wrong role: buyers cannot open admin pages, admin cannot open buyer pages
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
}