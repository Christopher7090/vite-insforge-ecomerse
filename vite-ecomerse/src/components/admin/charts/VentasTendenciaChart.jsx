import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function aggregateByDay(pedidos, days = 30) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  const map = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  for (const p of pedidos) {
    const d = new Date(p.created_at);
    if (d < cutoff) continue;
    const key = d.toISOString().slice(0, 10);
    if (key in map) map[key] += Number(p.total || 0);
  }

  return Object.entries(map)
    .map(([fecha, ingresos]) => ({ fecha, ingresos: Math.round(ingresos * 100) / 100 }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

const COLORS = ["#6366f1", "#818cf8"];

export default function VentasTendenciaChart({ pedidos = [], days = 30, height = 300 }) {
  const data = useMemo(() => aggregateByDay(pedidos, days), [pedidos, days]);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-medium text-slate-700">
        Ingresos por día — últimos {days} días
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => v.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `S/${v}`} />
          <Tooltip
            formatter={(v) => [`S/ ${v.toFixed(2)}`, "Ingresos"]}
            labelFormatter={(l) => `Fecha: ${l}`}
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke={COLORS[1]}
            strokeWidth={2}
            fill="url(#gradIngresos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
