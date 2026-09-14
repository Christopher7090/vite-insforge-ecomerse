import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { obtenerPedido } from "../../services/pedidosService";
import { obtenerProducto } from "../../services/productosService";
import Sidebar from "../../components/layout/Sidebar";

export default function PedidoDetalleClientePage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState({});
  const [productos, setProductos] = useState([]);
  const [nombreproducto, setNombreProducto] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPedido() {
    try {
      const pedidoData = await obtenerPedido(id);
      const productosData = await Promise.all(
        pedidoData.order_items.map(async (item) => {
          const producto = await obtenerProducto(item.producto_id);
          return { ...item, nombre: producto.nombre };
        })
      );
      setCargando(false);
      setPedido(pedidoData || []);
      setProductos(pedidoData.order_items || []);
      setNombreProducto(productosData.map((item) => item.nombre));
    } catch (error) {
      setError(error.message);
      setCargando(false);
    }
  }
  fetchPedido();
  }, [id]);

  if (!pedido) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:pt-8 sm:px-6">
        <div className="lg:flex lg:w-full">
          <Sidebar />
          <main className="lg:w-full lg:pl-8">
            <p className="text-slate-500">Pedido no encontrado.</p>
          </main>
        </div>
      </div>
    );
  }
  if(error) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:pt-8 sm:px-6">
        <div className="lg:flex lg:w-full">
          <Sidebar />
          <main className="lg:w-full lg:pl-8">
            <p className="text-slate-500">Error: {error}</p>
          </main>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 lg:pt-8 sm:px-6">
      <div className="lg:flex lg:w-full">
        <Sidebar />
        <main className="lg:w-full lg:pl-8">
          <h1 className="text-2xl font-heading mb-6">Detalle de pedido</h1>

          <Link to="/historial-pedidos" className="btn-ghost inline-block mb-4">
            ← Volver al historial
          </Link>

          <div className="card p-6 mb-6 space-y-2">
            <p className="text-sm text-slate-600">
              <strong>Número de pedido:</strong> {pedido.id}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Dirección de envío:</strong> {pedido.direccion_envio}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Método de pago:</strong> {pedido.metodo_pago}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Estado:</strong>{" "}
              <span className="badge">{pedido.estado}</span>
            </p>
            <p className="text-sm text-slate-600">
              <strong>Total:</strong> S/ {pedido.total?.toFixed(2)}
            </p>
          </div>

          <div className="overflow-x-auto card">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cantidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Precio unitario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-slate-800">{nombreproducto[idx]}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.cantidad}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">S/ {item.precio_unitario.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
