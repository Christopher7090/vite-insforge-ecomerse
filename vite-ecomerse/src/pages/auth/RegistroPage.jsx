import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { registrar, verificarEmail, reenviarVerificacion } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

// RF-02: registrar una cuenta nueva (nombre, correo, contrasena, telefono).
// RF-06: valida que los campos obligatorios no esten vacios.
export default function RegistroPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    telefono: "",
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargando, setCargando] = useState(false);

  // Email verification state
  const [verificacionRequerida, setVerificacionRequerida] = useState(false);
  const [correoVerificacion, setCorreoVerificacion] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [cargandoOtp, setCargandoOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [enviandoReenvio, setEnviandoReenvio] = useState(false);
  const [mensajeReenvio, setMensajeReenvio] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = "Ingresa tu nombre";
    if (!form.correo.trim()) nuevosErrores.correo = "Ingresa tu correo";
    else if (!/^\S+@\S+\.\S+$/.test(form.correo)) nuevosErrores.correo = "Correo inválido";
    if (!form.password.trim()) nuevosErrores.password = "Ingresa una contraseña";
    else if (form.password.length < 6) nuevosErrores.password = "Debe tener al menos 6 caracteres";
    if (form.confirmarPassword !== form.password)
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
    if (!form.telefono.trim()) nuevosErrores.telefono = "Ingresa tu teléfono";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGeneral("");
    if (!validar()) return;

    setCargando(true);
    const resultado = await registrar({
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      password: form.password,
      telefono: form.telefono.trim(),
      direccion: "",
    });
    setCargando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }

    if (resultado.requireEmailVerification) {
      setCorreoVerificacion(resultado.email);
      setVerificacionRequerida(true);
      return;
    }

    navigate("/");
  };

  const handleVerificarOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    if (!otp.trim() || otp.trim().length < 6) {
      setOtpError("Ingresa el código de 6 dígitos");
      return;
    }

    setCargandoOtp(true);
    const resultado = await verificarEmail(correoVerificacion, otp.trim());
    setCargandoOtp(false);

    if (!resultado.ok) {
      setOtpError(resultado.error);
      return;
    }

    await refreshProfile();
    navigate("/");
  };

  const handleReenviar = async () => {
    if (cooldown > 0 || enviandoReenvio) return;
    setEnviandoReenvio(true);
    setMensajeReenvio("");
    const resultado = await reenviarVerificacion(correoVerificacion);
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
      setOtpError(resultado.error);
    }
  };

  // Show OTP verification screen
  if (verificacionRequerida) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="card p-8">
          <h1 className="text-2xl">Verifica tu correo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enviamos un código de 6 dígitos a <strong>{correoVerificacion}</strong>. Ingrésalo
            a continuación.
          </p>

          {otpError && (
            <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {otpError}
            </div>
          )}

          <form onSubmit={handleVerificarOtp} className="mt-6 space-y-4" noValidate>
            <FormField
              label="Código de verificación"
              name="otp"
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError("");
              }}
              error={otpError}
              placeholder="123456"
              maxLength={6}
              required
            />

            <Button type="submit" className="w-full" disabled={cargandoOtp}>
              {cargandoOtp ? "Verificando..." : "Verificar correo"}
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
        <h1 className="text-2xl">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">Regístrate para comprar en TechStore.</p>

        {errorGeneral && (
          <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorGeneral}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <FormField
            label="Nombre completo"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errores.nombre}
            placeholder="Ana Torres"
            required
          />
          <FormField
            label="Correo electrónico"
            name="correo"
            type="email"
            value={form.correo}
            onChange={handleChange}
            error={errores.correo}
            placeholder="tucorreo@ejemplo.com"
            required
          />
          <FormField
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            error={errores.telefono}
            placeholder="999888777"
            required
          />
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errores.password}
            placeholder="Mínimo 6 caracteres"
            required
          />
          <FormField
            label="Confirmar contraseña"
            name="confirmarPassword"
            type="password"
            value={form.confirmarPassword}
            onChange={handleChange}
            error={errores.confirmarPassword}
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
