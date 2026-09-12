import { Link } from "react-router-dom";

// RF-50: pagina de error para rutas inexistentes.
export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="font-heading text-6xl font-semibold text-brand-600">404</span>
      <h1 className="mt-4 text-2xl">Esta página no existe</h1>
      <p className="mt-2 text-slate-500">Revisa la dirección o vuelve al catálogo.</p>
      <Link to="/" className="btn-primary mt-6">
        Volver al inicio
      </Link>
    </div>
  );
}
