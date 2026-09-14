import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarPedidos } from "../../services/pedidosService";

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

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    listarPedidos()
      .then(setPedidos)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const filtrados = pedidos.filter((p) => {
    const matchEstado = !filtroEstado || p.estado === filtroEstado;
    const matchBusqueda = !busqueda || p.id.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Pedidos</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por ID..."
          className="field-input max-w-xs"
        />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="field-input max-w-xs">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p className="mt-6 text-slate-500">Cargando pedidos...</p>
      ) : filtrados.length === 0 ? (
        <p className="mt-6 text-slate-500">No hay pedidos {filtroEstado ? `con estado "${ESTADO_LABELS[filtroEstado]}"` : ""}.</p>
      ) : (
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">#{p.id}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">S/ {Number(p.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[p.estado] || "bg-slate-50 text-slate-600"}`}>
                        {ESTADO_LABELS[p.estado] || p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/pedidos/${p.id}`} className="text-sm text-brand-600 hover:underline">Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
