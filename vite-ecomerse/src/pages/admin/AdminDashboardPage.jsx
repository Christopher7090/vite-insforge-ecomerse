import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { obtenerEstadisticas } from "../../services/adminService";

const ESTADO_COLORS = {
  pendiente: "bg-amber-50 text-amber-700",
  en_transito: "bg-blue-50 text-blue-700",
  entregado: "bg-green-50 text-green-700",
  cancelado: "bg-red-50 text-red-700",
};

const ESTADO_LABELS = {
  pendiente: "Pendiente",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerEstadisticas()
      .then(setStats)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <p className="text-slate-500">Cargando estadísticas...</p>;
  }

  const cards = [
    { label: "Productos", value: stats?.totalProductos ?? 0, color: "bg-blue-50 text-blue-700", to: "/admin/productos" },
    { label: "Pedidos", value: stats?.totalPedidos ?? 0, color: "bg-amber-50 text-amber-700", to: "/admin/pedidos" },
    { label: "Pendientes", value: stats?.pedidosPendientes ?? 0, color: "bg-orange-50 text-orange-700", to: "/admin/pedidos" },
    { label: "Usuarios", value: stats?.totalUsuarios ?? 0, color: "bg-green-50 text-green-700", to: "/admin/usuarios" },
    { label: "Ingresos", value: `S/ ${(stats?.totalIngresos ?? 0).toFixed(2)}`, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Resumen general de la tienda</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold ${card.color.split(" ")[1]}`}>{card.value}</p>
            {card.to && (
              <Link to={card.to} className="mt-2 block text-xs text-brand-600 hover:underline">Ver todos →</Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stats?.pedidosRecientes?.length > 0 && (
          <div className="card">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="font-medium text-slate-800">Pedidos recientes</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.pedidosRecientes.map((p) => (
                <Link key={p.id} to={`/admin/pedidos/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div>
                    <span className="font-medium text-slate-800">#{p.id}</span>
                    <span className="ml-2 text-sm text-slate-500">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">S/{Number(p.total).toFixed(2)}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[p.estado] || ""}`}>
                      {ESTADO_LABELS[p.estado] || p.estado}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {stats?.productosBajoStock?.length > 0 && (
          <div className="card">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="font-medium text-slate-800">Stock bajo</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.productosBajoStock.map((p) => (
                <Link key={p.id} to={`/admin/productos/${p.id}/editar`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <span className="font-medium text-slate-800">{p.nombre}</span>
                  <span className={`text-sm font-medium ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.stock === 0 ? "Sin stock" : `${p.stock} unidades`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
