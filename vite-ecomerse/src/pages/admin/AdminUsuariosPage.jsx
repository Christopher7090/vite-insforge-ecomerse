import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarUsuarios, cambiarRolUsuario } from "../../services/adminService";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const filtrados = usuarios.filter((u) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.profile?.name?.toLowerCase().includes(q) ||
      u.profile?.telefono?.includes(q)
    );
  });

  const handleCambiarRol = async (userId, usuarioEmail, nuevoRol) => {
    if (!confirm(`¿Cambiar rol de "${usuarioEmail}" a "${nuevoRol}"?`)) return;
    try {
      const updated = await cambiarRolUsuario(userId, nuevoRol);
      setUsuarios((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch { /* ignore */ }
  };

  const getRol = (u) => u.profile?.rol || "cliente";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Usuarios</h1>

      <div className="mt-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="field-input max-w-sm"
        />
      </div>

      {cargando ? (
        <p className="mt-6 text-slate-500">Cargando usuarios...</p>
      ) : filtrados.length === 0 ? (
        <p className="mt-6 text-slate-500">No se encontraron usuarios.</p>
      ) : (
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((u) => {
                  const rol = getRol(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {(u.profile?.name || u.email || "?")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{u.profile?.name || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">{u.profile?.telefono || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          rol === "admin" ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {rol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/pedidos`} state={{ usuario: u.id }} className="text-sm text-brand-600 hover:underline">Ver pedidos</Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rol === "admin" ? (
                          <button
                            onClick={() => handleCambiarRol(u.id, u.email, "cliente")}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Quitar admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCambiarRol(u.id, u.email, "admin")}
                            className="text-sm text-brand-600 hover:underline"
                          >
                            Hacer admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
