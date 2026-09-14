import { useState } from "react";
import { Link } from "react-router-dom";
import { agregarAlCarrito } from "../../services/carritoService";
import { getImageUrl } from "../../services/productosService";

export default function ProductCard({ producto, categoriaNombre }) {
  const [agregado, setAgregado] = useState(false);

  const imagenUrl = getImageUrl(producto.imagenes?.[0]);

  return (
    <div className="card group flex flex-col overflow-hidden transition hover:shadow-md">
      <Link to={`/producto/${producto.id}`} className="flex flex-1 flex-col">
        <div className="flex aspect-[4/3] items-center justify-center bg-brand-50">
          {imagenUrl ? (
            <img src={imagenUrl} alt={producto.nombre} className="h-full w-full object-contain p-4" />
          ) : (
            <span className="text-xs text-brand-300">Imagen del producto</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4 pb-0">
          {categoriaNombre && <span className="badge w-fit">{categoriaNombre}</span>}
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-brand-700">
            {producto.nombre}
          </h3>
          <p className="mt-auto pt-2 text-lg font-semibold text-brand-800">
            S/ {Number(producto.precio).toFixed(2)}
          </p>
          <p className="text-xs pb-5 text-slate-400">
            {producto.stock > 0 ? `${producto.stock} disponibles` : "Sin stock"}
          </p>
        </div>
      </Link>
    </div>
  );
}
