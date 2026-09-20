import { useState, useEffect, useMemo } from "react";
import { obtenerAnaliticas } from "../../services/adminService";
import VentasTendenciaChart from "../../components/admin/charts/VentasTendenciaChart";
import PedidosEstadoChart from "../../components/admin/charts/PedidosEstadoChart";
import ProductosTopChart from "../../components/admin/charts/ProductosTopChart";
import CategoriasChart from "../../components/admin/charts/CategoriasChart";

const RANGES = [
  { label: "7 días", value: 7 },
  { label: "30 días", value: 30 },
  { label: "90 días", value: 90 },
];

export default function AdminAnalyticsPage() {
  const [raw, setRaw] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [rango, setRango] = useState(30);

  useEffect(() => {
    obtenerAnaliticas()
      .then(setRaw)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const stats = useMemo(() => {
    if (!raw) return null;
    const { pedidos, productos } = raw;
    const totalIngresos = pedidos.reduce((a, p) => a + Number(p.total || 0), 0);
    const totalPedidos = pedidos.length;
    const ticketPromedio = totalPedidos > 0 ? totalIngresos / totalPedidos : 0;
    const productosVendidos = pedidos.reduce((a, p) => {
      if (!p.order_items) return a;
      return a + p.order_items.reduce((b, i) => b + (i.cantidad || 0), 0);
    }, 0);
    return { totalIngresos, totalPedidos, ticketPromedio, productosVendidos, totalProductos: productos.length };
  }, [raw]);

  if (cargando) {
    return <p className="text-slate-500">Cargando analíticas...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Analíticas</h1>
          <p className="mt-1 text-sm text-slate-500">Métricas detalladas de la tienda</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRango(r.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                rango === r.value
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Ingresos totales", value: `S/ ${stats.totalIngresos.toFixed(2)}` },
            { label: "Pedidos", value: stats.totalPedidos },
            { label: "Ticket promedio", value: `S/ ${stats.ticketPromedio.toFixed(2)}` },
            { label: "Unidades vendidas", value: stats.productosVendidos },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {raw && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <VentasTendenciaChart pedidos={raw.pedidos} days={rango} />
          <PedidosEstadoChart pedidos={raw.pedidos} />
          <ProductosTopChart pedidos={raw.pedidos} productos={raw.productos} />
          <CategoriasChart
            pedidos={raw.pedidos}
            productos={raw.productos}
            categorias={raw.categorias}
          />
        </div>
      )}
    </div>
  );
}
