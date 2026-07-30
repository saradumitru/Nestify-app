import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();

  let user = null;
  const token = localStorage.getItem("token");

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    user = null;
  }

  if (!token || !user) {
    return (
      <Navigate
        to={`/login?message=auth-required&redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // ADMIN poate accesa orice pagina, indiferent de rolul specificat
    if (user.role !== 'ADMIN' && !allowed.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;

