import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { enviarRecuperacion } from "../../services/authService";

// RF-03: solicitar la recuperacion de contrasena mediante correo.
export default function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [enviandoReenvio, setEnviandoReenvio] = useState(false);
  const [mensajeReenvio, setMensajeReenvio] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo.trim()) {
      setError("Ingresa tu correo");
      return;
    }
    setError("");
    setCargando(true);
    await enviarRecuperacion(correo.trim());
    setCargando(false);
    setEnviado(true);
  };

  const handleContinuar = () => {
    navigate(`/reset-password?correo=${encodeURIComponent(correo.trim())}`);
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
      setError(resultado.error);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="card p-8">
        <h1 className="text-2xl">Recupera tu contraseña</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ingresa tu correo y te enviaremos instrucciones para restablecerla.
        </p>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <FormField
              label="Correo electrónico"
              name="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              error={error}
              placeholder="tucorreo@ejemplo.com"
              required
            />
            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
              Si <strong>{correo}</strong> está registrado, recibirás un correo con un código de
              6 dígitos para restablecer tu contraseña.
            </div>

            {mensajeReenvio && (
              <div className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
                {mensajeReenvio}
              </div>
            )}

            <Button className="w-full" onClick={handleContinuar}>
              Continuar a restablecer contraseña
            </Button>

            <div className="text-center text-sm text-slate-500">
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
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
