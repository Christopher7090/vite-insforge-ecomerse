import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function computeTopProducts(pedidos, productos, limit = 10) {
  const revMap = {};
  const qtyMap = {};

  for (const p of pedidos) {
    if (!p.order_items) continue;
    for (const item of p.order_items) {
      const pid = item.producto_id;
      revMap[pid] = (revMap[pid] || 0) + Number(item.precio_unitario || 0) * (item.cantidad || 0);
      qtyMap[pid] = (qtyMap[pid] || 0) + (item.cantidad || 0);
    }
  }

  const prodMap = {};
  for (const prod of productos) {
    prodMap[prod.id] = prod.nombre;
  }

  return Object.entries(revMap)
    .map(([id, revenue]) => ({
      nombre: prodMap[id] || id.slice(0, 12),
      ingresos: Math.round(revenue * 100) / 100,
      unidades: qtyMap[id] || 0,
    }))
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, limit);
}

export default function ProductosTopChart({ pedidos = [], productos = [], limit = 10, height = 300 }) {
  const data = useMemo(() => computeTopProducts(pedidos, productos, limit), [pedidos, productos, limit]);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-medium text-slate-700">
        Top {limit} productos por ingreso
      </h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `S/${v}`} />
            <YAxis
              type="category"
              dataKey="nombre"
              tick={{ fontSize: 11, fill: "#64748b" }}
              width={120}
              tickFormatter={(v) => (v.length > 16 ? v.slice(0, 16) + "…" : v)}
            />
            <Tooltip
              formatter={(v, name) =>
                name === "ingresos" ? [`S/ ${v.toFixed(2)}`, "Ingresos"] : [v, "Unidades"]
              }
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="ingresos" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
