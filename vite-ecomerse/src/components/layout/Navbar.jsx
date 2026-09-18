import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { obtenerCarrito, getGuestCartCount, onGuestCartUpdate } from "../../services/carritoService";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, profile, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const [cantidadCarrito, setCantidadCarrito] = useState(() => getGuestCartCount());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const ctrl = { cancelled: false };  
    if (!isAuthenticated) {
      const unsub = onGuestCartUpdate(() => {
        if (!ctrl.cancelled) setCantidadCarrito(getGuestCartCount());
      });
      return () => { ctrl.cancelled = true; unsub(); };
    }

    obtenerCarrito()
      .then((items) => {
        if (!ctrl.cancelled) setCantidadCarrito(items.reduce((acc, i) => acc + i.cantidad, 0));
      })
      .catch(() => {});
    return () => { ctrl.cancelled = true; };
  }, [isAuthenticated,navigate]);

  const handleDropdownToggle = () => setShowDropdown(!showDropdown);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            TS
          </span>
          <span className="font-heading text-lg font-semibold text-brand-900">TechStore</span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link to="/catalogo" className="text-sm font-medium text-slate-600 hover:text-brand-700">
            Catálogo
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              Panel admin
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/perfil" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              Perfil
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/carrito" className="btn-ghost relative">
            Carrito
            {cantidadCarrito > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-semibold text-white">
                {cantidadCarrito}
              </span>
            )}
          </Link>

          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
          ) : isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                Hola, {(profile?.nombre || user?.email || "").split(" ")[0]}
              </span>
              <div className="relative">
                <button
                  onClick={handleDropdownToggle}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
                >
                  Mi cuenta
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 z-20 mt-2 min-w-max w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                    <Link to="/perfil" onClick={handleDropdownToggle} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      Perfil
                    </Link>
                    <Link to="/editar-perfil" onClick={handleDropdownToggle} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      Editar perfil
                    </Link>
                    <Link to="/cambiar-password" onClick={handleDropdownToggle} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      Cambiar contraseña
                    </Link>
                    <Link to="/historial-pedidos" onClick={handleDropdownToggle} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      Historial de pedidos
                    </Link>
                    <hr className="my-1 border-t border-slate-200" />
                    <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-primary">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
