import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { obtenerPedido } from "../../services/pedidosService";

export default function PagoExitoPage() {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const { user } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(!!pedidoId);

  useEffect(() => {
    if (!pedidoId) return;
    let cancelled = false;
    obtenerPedido(pedidoId)
      .then((p) => { if (!cancelled) setPedido(p); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCargando(false); });
    return () => { cancelled = true; };
  }, [pedidoId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">¡Pago exitoso!</h1>
      <p className="mt-2 text-slate-500">
        Tu pago fue procesado correctamente por Stripe.
      </p>

      {!cargando && pedido && (
        <div className="mt-6 card p-6 text-left">
          <p className="text-sm text-slate-500">Pedido</p>
          <p className="text-lg font-semibold text-brand-800">#{pedido.id}</p>
          <p className="mt-2 text-sm text-slate-500">Estado: <span className="font-medium text-slate-700">{pedido.estado}</span></p>
          <p className="text-sm text-slate-500">Total: <span className="font-medium text-slate-700">S/ {pedido.total}</span></p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {user && (
          <Link to="/historial-pedidos" className="btn-primary">Ver mis pedidos</Link>
        )}
        <Link to="/catalogo" className="btn-ghost border border-slate-200">Seguir comprando</Link>
      </div>
    </div>
  );
}
