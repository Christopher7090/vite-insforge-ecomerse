import { Link } from "react-router-dom";

// RF-49: pie de pagina con informacion de contacto y enlaces.
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} TechStore. Proyecto académico — Herramientas de Desarrollo.
        </p>
        <div className="flex gap-5">
          <a href="mailto:contacto@techstore.test" className="hover:text-brand-700">
            contacto@techstore.test
          </a>
          <Link to="/catalogo" className="hover:text-brand-700">
            Catálogo
          </Link>
        </div>
      </div>
    </footer>
  );
}
