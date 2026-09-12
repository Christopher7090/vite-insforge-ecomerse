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
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-10 w-10 shrink-0 rounded bg-brand-50 flex items-center justify-center overflow-hidden">
                        {getImageUrl(p.imagenes?.[0]) ? (
                          <img src={getImageUrl(p.imagenes?.[0])} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-brand-300">Img</span>
                        )}
                      </div>
                      <span className="font-medium text-slate-800">{p.nombre}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{categoriaNombre(p.categoria_id)}</td>
                    <td className="px-4 py-3 text-slate-600">S/ {Number(p.precio).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/productos/${p.id}/editar`} className="text-sm text-brand-600 hover:underline">Editar</Link>
                      <button onClick={() => handleEliminar(p.id, p.nombre)} className="ml-3 text-sm text-red-500 hover:underline">Eliminar</button>
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
