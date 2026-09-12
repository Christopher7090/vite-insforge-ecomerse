import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="bg-white shadow-sm border-r border-slate-200 min-h-screen flex flex-col pt-6">
      <nav className="space-y-2 px-4 pb-8">
        <Link to="/perfil" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition-colors">
          Perfil
        </Link>

        <Link to="/editar-perfil" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition-colors">
          Editar perfil
        </Link>

        <Link to="/cambiar-password" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition-colors">
          Cambiar contraseña
        </Link>

        <Link to="/historial-pedidos" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition-colors">
          Historial de pedidos
        </Link>
      </nav>
    </aside>
  );
}