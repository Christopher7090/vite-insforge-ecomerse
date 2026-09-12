import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { restablecerPassword } from "../../services/authService";

// RF-04: restablecer la contrasena desde el enlace recibido.
export default function RestablecerPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const correo = searchParams.get("correo") ?? "";

  const [form, setForm] = useState({ code: "", password: "", confirmarPassword: "" });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
    setErrorGeneral("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (!form.code.trim() || form.code.trim().length < 6)
      nuevosErrores.code = "Ingresa el código de 6 dígitos";
    if (!form.password.trim() || form.password.length < 6)
      nuevosErrores.password = "Debe tener al menos 6 caracteres";
    if (form.confirmarPassword !== form.password)
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setCargando(true);
    const resultado = await restablecerPassword(correo, form.code.trim(), form.password);
    setCargando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }

    setListo(true);
  };

  if (!correo) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 text-center sm:px-6">
        <div className="card p-8">
          <h1 className="text-xl">Enlace inválido</h1>
          <p className="mt-2 text-sm text-slate-500">
            No se proporcionó un correo válido. Solicita un nuevo enlace de restablecimiento.
          </p>
          <Link to="/recuperar-password" className="btn-primary mt-6 inline-flex">
            Solicitar uno nuevo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="card p-8">
        <h1 className="text-2xl">Restablece tu contraseña</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ingresa el código que recibiste en <strong>{correo}</strong> y tu nueva contraseña.
        </p>

        {errorGeneral && (
          <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorGeneral}
          </div>
        )}

        {listo ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-green-50 px-3.5 py-3 text-sm text-green-700">
              Tu contraseña se actualizó correctamente.
            </div>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <FormField
              label="Código de verificación"
              name="code"
              type="text"
              value={form.code}
              onChange={handleChange}
              error={errores.code}
              placeholder="123456"
              maxLength={6}
              required
            />
            <FormField
              label="Nueva contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errores.password}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <FormField
              label="Confirmar nueva contraseña"
              name="confirmarPassword"
              type="password"
              value={form.confirmarPassword}
              onChange={handleChange}
              error={errores.confirmarPassword}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? "Restableciendo..." : "Restablecer contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
