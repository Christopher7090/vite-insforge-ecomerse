import { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { obtenerPedido } from "../../services/pedidosService";
import { obtenerProducto } from "../../services/productosService";

export default function ConfirmacionPedidoPage() {
  const location = useLocation();
  const pedidoId = location.state?.pedidoId;
  const [pedido, setPedido] = useState(null);
  const [itemsConProducto, setItemsConProducto] = useState([]);
  const [cargando, setCargando] = useState(!!pedidoId);

  useEffect(() => {
    if (!pedidoId) return;

    async function cargar() {
      try {
        const ped = await obtenerPedido(pedidoId);
        setPedido(ped);

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
          setItemsConProducto(items);
        }
      } catch {
        setPedido(null);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [pedidoId]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-slate-500">Cargando confirmación...</p>
      </div>
    );
  }

  if (!pedido) {
    return <Navigate to="/catalogo" replace />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="card p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
          ✓
        </div>
        <h1 className="mt-4 text-2xl">¡Pedido confirmado!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tu pedido <strong>#{pedido.id}</strong> fue registrado correctamente.
        </p>

        <div className="mt-6 space-y-2 text-left text-sm text-slate-600">
          {itemsConProducto.map((item) => (
            <div key={item.producto_id} className="flex justify-between gap-2">
              <span>{item.producto?.nombre ?? "Producto"} × {item.cantidad}</span>
              <span className="shrink-0">S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-brand-800">
          <span>Total</span>
          <span>S/ {Number(pedido.total).toFixed(2)}</span>
        </div>

        <Link to="/catalogo" className="btn-primary mt-8 inline-flex">Seguir comprando</Link>
      </div>
    </div>
  );
}
