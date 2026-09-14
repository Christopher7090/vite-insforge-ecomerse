import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import Sidebar from "../../components/layout/Sidebar";

export default function EditarPerfilPage() {
  const { user, profile, updateProfile, loading } = useAuth();

  const [form, setForm] = useState({
    nombre: profile?.name || "",
    telefono: profile?.telefono || "",
    direccion: profile?.direccion || "",
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGeneral("");
    setMensaje("");
    if (!validar()) return;

    setCargando(true);
    const resultado = await updateProfile({
      name: form.nombre.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
    });
    setCargando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }

    setMensaje("Perfil actualizado correctamente");
    setTimeout(() => setMensaje(""), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="lg:flex lg:w-full">
          <Sidebar />
          <main className="lg:w-full lg:pl-8">
            <h1 className="mb-6 text-2xl font-heading">Editar perfil</h1>
            <p className="text-slate-500">Cargando...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="lg:flex lg:w-full">
        <Sidebar />

        <main className="lg:w-full lg:pl-8">
          <h1 className="mb-6 text-2xl font-heading">Editar perfil</h1>

          {errorGeneral && (
            <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {errorGeneral}
            </div>
          )}

          {mensaje && (
            <div className="mt-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={errores.nombre}
              placeholder="Nombre completo"
              required
            />
            <div>
              <label className="field-label">Correo electrónico</label>
              <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
              <p className="mt-0.5 text-xs text-slate-400">El correo no se puede cambiar</p>
            </div>
            <FormField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              error={errores.telefono}
              placeholder="999-888-777"
            />
            <FormField
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              error={errores.direccion}
              placeholder="Dirección completa"
            />

            <div className="mt-6 flex justify-end">
              <Button type="submit" className="btn-primary" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Link to="/perfil" className="ml-4 btn-ghost">
                Cancelar
              </Link>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
