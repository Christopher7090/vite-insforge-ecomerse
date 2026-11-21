import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarProductos, eliminarProducto, getImageUrl } from "../../services/productosService";
import { listarCategorias } from "../../services/categoriasService";

export default function AdminProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([listarProductos(), listarCategorias()])
      .then(([p, c]) => { setProductos(p); setCategorias(c); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const categoriaNombre = (id) => categorias.find((c) => c.id === id)?.nombre ?? "—";

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await eliminarProducto(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn-primary">+ Nuevo producto</Link>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
          className="field-input max-w-sm"
        />
      </div>

      {cargando ? (
        <p className="mt-6 text-slate-500">Cargando productos...</p>
      ) : filtrados.length === 0 ? (
        <p className="mt-6 text-slate-500">No se encontraron productos.</p>
      ) : (
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-10 w-10 shrink-0 rounded bg-brand-50 flex items-center justify-center overflow-hidden">
                        {p.imagenes?.[0] ? (
                          <img src={getImageUrl(p.imagenes?.[0])} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <img src="../../src/assets/images.png" alt="" className="h-full w-full object-contain" />
                        )}
                      </div>
                      <span className="font-medium text-slate-800">{p.nombre}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{categoriaNombre(p.categoria_id)}</td>
                    <td className="px-4 py-3 text-slate-600">S/{Number(p.precio).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center justify-center flex">
                      <Link to={`/admin/productos/${p.id}/editar`} className="whitespace-nowrap bg-brand-500  text-sm rounded-md p-1 text-brand-100 hover:bg-brand-400 hover:text-white transition-colors items-center gap-1 ">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Link>
                      <button onClick={() => handleEliminar(p.id, p.nombre)} className="whitespace-nowrap ml-2 bg-red-500 text-sm rounded-md p-1 text-red-100 hover:bg-red-400 hover:text-white transition-colors items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
