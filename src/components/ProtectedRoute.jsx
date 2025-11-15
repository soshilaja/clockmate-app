// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

/**
 * A wrapper for protecting routes based on user session and role.
 * Redirects unauthenticated users to the login page (/).
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();

  // Read session safely from localStorage
  let session = null;
  try {
    const saved = localStorage.getItem("session");
    session = saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem("session");
  }

  // Not logged in → go to login
  if (!session) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Logged in but role doesn’t match → go to dashboard appropriate for role
  if (requiredRole && session?.user?.role !== requiredRole) {
    const redirectPath =  session.user?.role === "admin" ? "/admin" : "/dashboard";
  } else if (requiredRole && session?.role !== requiredRole) {
    const redirectPath =  session.role === "admin" ? "/admin" : "/dashboard";
  }else{
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise render the protected content
  return children;
}