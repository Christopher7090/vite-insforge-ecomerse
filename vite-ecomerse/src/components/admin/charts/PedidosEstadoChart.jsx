import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const STATUS_CONFIG = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  pagado: { label: "Pagado", color: "#3b82f6" },
  en_transito: { label: "En tránsito", color: "#6366f1" },
  entregado: { label: "Entregado", color: "#22c55e" },
  cancelado: { label: "Cancelado", color: "#ef4444" },
};

function aggregateByStatus(pedidos) {
  const counts = {};
  for (const p of pedidos) {
    counts[p.estado] = (counts[p.estado] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({
      name: STATUS_CONFIG[name]?.label || name,
      value,
      color: STATUS_CONFIG[name]?.color || "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);
}

const renderTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow">
      <p className="font-medium text-slate-700">{name}</p>
      <p className="text-slate-500">{value} pedido{value !== 1 ? "s" : ""}</p>
    </div>
  );
};

export default function PedidosEstadoChart({ pedidos = [], height = 300 }) {
  const data = useMemo(() => aggregateByStatus(pedidos), [pedidos]);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-medium text-slate-700">Pedidos por estado</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
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
