import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { restablecerPassword, enviarRecuperacion } from "../../services/authService";

// RF-04: restablecer la contrasena desde el enlace recibido.
export default function RestablecerPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const correoParam = searchParams.get("correo") ?? "";

  const [correo, setCorreo] = useState(correoParam);
  const [correoIngresado, setCorreoIngresado] = useState(!!correoParam);
  const [form, setForm] = useState({ code: "", password: "", confirmarPassword: "" });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [enviandoReenvio, setEnviandoReenvio] = useState(false);
  const [mensajeReenvio, setMensajeReenvio] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
    setErrorGeneral("");
  };

  const handleCorreoSubmit = (e) => {
    e.preventDefault();
    if (!correo.trim()) {
      setErrores({ correo: "Ingresa tu correo" });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      setErrores({ correo: "Correo inválido" });
      return;
    }
    setErrores({});
    setCorreoIngresado(true);
  };

  const handleReenviar = async () => {
    if (cooldown > 0 || enviandoReenvio) return;
    setEnviandoReenvio(true);
    setMensajeReenvio("");
    const resultado = await enviarRecuperacion(correo.trim());
    setEnviandoReenvio(false);
    if (resultado.ok) {
      setMensajeReenvio("Código reenviado. Revisa tu correo.");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setErrorGeneral(resultado.error);
    }
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
    const resultado = await restablecerPassword(correo.trim(), form.code.trim(), form.password);
    setCargando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }

    setListo(true);
  };

  // Step 0: no email yet — ask for it
  if (!correoIngresado) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="card p-8">
          <h1 className="text-2xl">Restablece tu contraseña</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa tu correo y te enviaremos un código de 6 dígitos.
          </p>

          <form onSubmit={handleCorreoSubmit} className="mt-6 space-y-4" noValidate>
            <FormField
              label="Correo electrónico"
              name="correo"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                setErrores({ ...errores, correo: "" });
              }}
              error={errores.correo}
              placeholder="tucorreo@ejemplo.com"
              required
            />
            <Button type="submit" className="w-full">
              Enviar código
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
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
          <>
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

            {mensajeReenvio && (
              <div className="mt-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
                {mensajeReenvio}
              </div>
            )}

            <div className="mt-4 text-center text-sm text-slate-500">
              ¿No recibiste el código?{" "}
              <button
                type="button"
                onClick={handleReenviar}
                disabled={cooldown > 0 || enviandoReenvio}
                className="font-medium text-brand-600 hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : enviandoReenvio
                    ? "Reenviando..."
                    : "Reenviar código"}
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              <Link to="/login" className="font-medium text-brand-600 hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
