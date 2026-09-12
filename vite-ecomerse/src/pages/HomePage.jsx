import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarCategorias } from "../services/categoriasService";

export default function HomePage() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-brand-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="badge bg-brand-800 text-brand-100">Tecnología para estudiar, trabajar y jugar</p>
          <h1 className="mt-4 max-w-xl text-4xl text-white sm:text-5xl">
            Laptops, PCs y periféricos al mejor precio
          </h1>
          <p className="mt-4 max-w-lg text-brand-100">
            Explora nuestro catálogo y encuentra el equipo ideal para lo que necesitas.
          </p>
          <Link to="/catalogo" className="btn-primary mt-8 bg-accent-500 hover:bg-accent-600">
            Ver catálogo
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-2xl">Categorías</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo?categoria=${cat.id}`}
              className="card flex items-center justify-center px-4 py-8 text-center font-medium text-brand-800 hover:border-brand-300 hover:shadow-md transition"
            >
              {cat.nombre}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
