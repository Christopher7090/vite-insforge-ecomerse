import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const PALETTE = ["#6366f1", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

function aggregateByCategory(pedidos, productos, categorias) {
  const catMap = {};
  for (const c of categorias) catMap[c.id] = c.nombre;

  const prodCatMap = {};
  for (const p of productos) {
    const catName = typeof p.categories === "object" && p.categories !== null
      ? p.categories.nombre
      : catMap[p.categoria_id] || "Sin categoría";
    prodCatMap[p.id] = catName;
  }

  const revMap = {};
  for (const order of pedidos) {
    if (!order.order_items) continue;
    for (const item of order.order_items) {
      const cat = prodCatMap[item.producto_id] || "Sin categoría";
      revMap[cat] = (revMap[cat] || 0) + Number(item.precio_unitario || 0) * (item.cantidad || 0);
    }
  }

  return Object.entries(revMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}

const renderTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow">
      <p className="font-medium text-slate-700">{name}</p>
      <p className="text-slate-500">S/ {value.toFixed(2)}</p>
    </div>
  );
};

export default function CategoriasChart({ pedidos = [], productos = [], categorias = [], height = 300 }) {
  const data = useMemo(() => aggregateByCategory(pedidos, productos, categorias), [pedidos, productos, categorias]);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-medium text-slate-700">Ingresos por categoría</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
