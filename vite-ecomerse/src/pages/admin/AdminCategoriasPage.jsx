import { useState, useEffect } from "react";
import { listarCategorias, crearCategoria, editarCategoria, eliminarCategoria } from "../../services/categoriasService";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      const cat = await crearCategoria({ nombre: nombre.trim() });
      setCategorias((prev) => [...prev, cat]);
      setNombre("");
    } catch { /* ignore */ }
    setGuardando(false);
  };

  const startEdit = (cat) => { setEditId(cat.id); setEditNombre(cat.nombre); };
  const cancelEdit = () => { setEditId(null); setEditNombre(""); };

  const handleGuardar = async (id) => {
    if (!editNombre.trim()) return;
    const updated = await editarCategoria(id, { nombre: editNombre.trim() });
    setCategorias((prev) => prev.map((c) => (c.id === id ? updated : c)));
    cancelEdit();
  };

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar categoría "${nombre}"?`)) return;
    await eliminarCategoria(id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Categorías</h1>

      <form onSubmit={handleCrear} className="mt-6 card flex items-end gap-4 p-6">
        <div className="flex-1">
          <FormField label="Nueva categoría" name="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <Button type="submit" disabled={guardando}>{guardando ? "..." : "Crear"}</Button>
      </form>

      {cargando ? (
        <p className="mt-6 text-slate-500">Cargando...</p>
      ) : categorias.length === 0 ? (
        <p className="mt-6 text-slate-500">No hay categorías.</p>
      ) : (
        <div className="mt-4 card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorias.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {editId === cat.id ? (
                      <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="field-input max-w-xs" autoFocus />
                    ) : (
                      <span className="font-medium text-slate-800">{cat.nombre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editId === cat.id ? (
                      <>
                        <button onClick={() => handleGuardar(cat.id)} className="rounded-md p-1 bg-brand-500 text-sm text-brand-100 hover:bg-brand-400 hover:text-white transition-colors">Guardar</button>
                        <button onClick={cancelEdit} className="rounded-md p-1 bg-red-500 text-sm text-slate-100 hover:bg-red-400 hover:text-white transition-colors ml-2">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(cat)} className="whitespace-nowrap bg-brand-500  text-sm rounded-md p-1 text-brand-100 hover:bg-brand-400 hover:text-white transition-colors items-center gap-1 ">
                          <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar</button>
                        <button onClick={() => handleEliminar(cat.id, cat.nombre)} className="whitespace-nowrap ml-2 bg-red-500 text-sm rounded-md p-1 text-red-100 hover:bg-red-400 hover:text-white transition-colors items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
