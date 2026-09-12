import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// RF-51 / RF-52: restringe rutas a usuarios logueados (y opcionalmente a un rol especifico),
// y redirige al login si no corresponde.
//
// Uso:
//   <Route element={<ProtectedRoute />}>...rutas de cliente...</Route>
//   <Route element={<ProtectedRoute rolRequerido="admin" />}>...rutas de admin...</Route>
export default function ProtectedRoute({ children, rolRequerido }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido && profile?.rol !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return children;
}
