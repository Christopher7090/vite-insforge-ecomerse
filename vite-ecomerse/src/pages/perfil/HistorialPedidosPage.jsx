import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../../components/layout/Sidebar";
import Button from "../../components/ui/Button";
import { listarPedidosDeUsuario } from "../../services/pedidosService";

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

export default function HistorialPedidosPage() {
  const { user, loading } = useAuth();
  const [pedidos, setPedidos] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    listarPedidosDeUsuario(user.id)
      .then((data) => { if (!cancelled) setPedidos(data); })
      .catch(() => { if (!cancelled) setPedidos([]); });
    return () => { cancelled = true; };
  }, [user, loading]);

  const cargando = loading || pedidos === null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="lg:flex lg:w-full">
        <Sidebar />

        <main className="lg:w-full lg:pl-8">
          <h1 className="mb-6 text-2xl font-heading">Historial de pedidos</h1>

          {cargando ? (
            <p className="text-slate-500">Cargando...</p>
          ) : !pedidos.length ? (
            <div className="card p-8">
              <p className="text-slate-600">No tienes pedidos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-heading text-slate-500">Número de pedido</p>
                      <p className="text-2xl font-bold text-brand-600">#{pedido.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        Fecha: {new Date(pedido.fecha).toLocaleDateString()}
                      </p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[pedido.estado] || "bg-slate-50 text-slate-600"}`}>
                        {ESTADO_LABELS[pedido.estado] || pedido.estado}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-sm text-slate-500">{pedido.direccion_envio}</p>
                    <p className="font-semibold text-brand-800">S/ {Number(pedido.total).toFixed(2)}</p>
                  </div>
                  <div className="justify-end mt-4 flex">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/pedido-detalle/${pedido.id}`)}
                    >
                    Ver detalle
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Link to="/perfil" className="btn-ghost">
              Volver al perfil
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
