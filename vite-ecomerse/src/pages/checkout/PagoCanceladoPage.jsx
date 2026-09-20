import { Link, useSearchParams } from "react-router-dom";

export default function PagoCanceladoPage() {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Pago cancelado</h1>
      <p className="mt-2 text-slate-500">
        El pago no fue completado. Tu pedido sigue pendiente.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {pedidoId && (
          <Link to={`/pedido/${pedidoId}`} className="btn-primary">Ver pedido</Link>
        )}
        <Link to="/carrito" className="btn-ghost border border-slate-200">Volver al carrito</Link>
      </div>
    </div>
  );
}
