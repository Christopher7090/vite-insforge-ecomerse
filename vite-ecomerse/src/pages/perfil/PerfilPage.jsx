import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../../components/layout/Sidebar";

export default function PerfilPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="lg:flex lg:w-full">
          <Sidebar />
          <main className="lg:w-full lg:pl-8">
            <h1 className="mb-6 text-2xl font-heading">Mi perfil</h1>
            <div className="card p-8">
              <p className="text-slate-500">Cargando perfil...</p>
            </div>
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
          <h1 className="mb-6 text-2xl font-heading">Mi perfil</h1>

          <div className="card p-8 mb-8">
            <div className="space-y-4">
              <p className="text-slate-600">
                <strong>Nombre:</strong> {profile?.name || "—"}
              </p>
              <p className="text-slate-600">
                <strong>Correo:</strong> {user?.email || "—"}
              </p>
              <p className="text-slate-600">
                <strong>Teléfono:</strong> {profile?.telefono || "—"}
              </p>
              <p className="text-slate-600">
                <strong>Dirección:</strong> {profile?.direccion || "—"}
              </p>
              <p className="text-slate-600">
                <strong>Rol:</strong> {profile?.rol || "cliente"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
