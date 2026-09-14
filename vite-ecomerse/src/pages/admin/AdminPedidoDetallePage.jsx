import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { obtenerPedido, actualizarEstadoPedido } from "../../services/pedidosService";
import { obtenerProducto } from "../../services/productosService";
import { obtenerUsuario, eliminarPedido } from "../../services/adminService";
import Button from "../../components/ui/Button";
import insforge from "../../services/insforgeClient";

const ESTADOS = ["pendiente", "en_transito", "entregado", "cancelado"];

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

export default function AdminPedidoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [itemsConProducto, setItemsConProducto] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function cargar() {
      try {
        const ped = await obtenerPedido(id);
        if (cancelled) return;
        setPedido(ped);
        setNuevoEstado(ped.estado);

        if (ped.usuario_id) {
          const u = await obtenerUsuario(ped.usuario_id);
          if (!cancelled) setUsuario(u);
        }

        if (ped.order_items) {
          const items = [];
          for (const item of ped.order_items) {
            try {
              const prod = await obtenerProducto(item.producto_id);
              items.push({ ...item, producto: prod });
            } catch {
              items.push({ ...item, producto: null });
            }
          }
          if (!cancelled) setItemsConProducto(items);
        }
      } catch {
        if (!cancelled) setPedido(null);
      } finally {
        if (!cancelled) setCargando(false);
      }
    }
    cargar();

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (cargando || !pedido) return;

    let unsubscribed = false;

    async function subscribe() {
      try {
        await insforge.realtime.connect();
        const response = await insforge.realtime.subscribe(`order:${id}`);
        if (!response.ok || unsubscribed) return;

        insforge.realtime.on("status_changed", (payload) => {
          if (payload.id === id) {
            setPedido((prev) => prev ? { ...prev, estado: payload.estado } : prev);
            setNuevoEstado(payload.estado);
          }
        });
      } catch {
        // realtime not available, continue without it
      }
    }

    subscribe();

    return () => {
      unsubscribed = true;
      insforge.realtime.unsubscribe(`order:${id}`);
    };
  }, [id, cargando, pedido]);

  const handleActualizarEstado = async () => {
    if (nuevoEstado === pedido.estado) return;
    setGuardando(true);
    try {
      const updated = await actualizarEstadoPedido(id, nuevoEstado);
      setPedido(updated);
    } catch { /* ignore */ }
    setGuardando(false);
  };

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar pedido #${id}? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarPedido(id);
      navigate("/admin/pedidos");
    } catch { /* ignore */ }
  };

  if (cargando) return <p className="text-slate-500">Cargando...</p>;
  if (!pedido) return <p className="text-slate-500">Pedido no encontrado.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/pedidos" className="text-sm text-brand-600 hover:underline">← Volver a pedidos</Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Pedido #{pedido.id}</h1>
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_COLORS[pedido.estado] || ""}`}>
          {ESTADO_LABELS[pedido.estado] || pedido.estado}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-sm font-medium text-slate-500">Cliente</h2>
          <p className="mt-1 font-medium text-slate-800">{usuario?.profile?.nombre || "—"}</p>
          <p className="text-sm text-slate-600">{usuario?.email || "—"}</p>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-medium text-slate-500">Envío</h2>
          <p className="mt-1 text-slate-800">{pedido.direccion_envio}</p>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-medium text-slate-500">Pago</h2>
          <p className="mt-1 text-slate-800">{pedido.metodo_pago}</p>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 text-center">Cantidad</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {itemsConProducto.map((item) => (
              <tr key={item.producto_id}>
                <td className="px-4 py-3 font-medium text-slate-800">{item.producto?.nombre ?? "Producto"}</td>
                <td className="px-4 py-3 text-center text-slate-600">{item.cantidad}</td>
                <td className="px-4 py-3 text-right text-slate-600">S/ {Number(item.precio_unitario).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-200 px-4 py-3 text-right text-lg font-semibold text-brand-800">
          Total: S/ {Number(pedido.total).toFixed(2)}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="text-sm font-medium text-slate-500">Actualizar estado</h2>
        <div className="mt-3 flex items-center gap-3">
          <select
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            className="field-input max-w-xs"
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
            ))}
          </select>
          <Button onClick={handleActualizarEstado} disabled={guardando || nuevoEstado === pedido.estado}>
            {guardando ? "..." : "Actualizar"}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={handleEliminar} className="text-sm text-red-500 hover:underline">Eliminar pedido</button>
      </div>
    </div>
  );
}
