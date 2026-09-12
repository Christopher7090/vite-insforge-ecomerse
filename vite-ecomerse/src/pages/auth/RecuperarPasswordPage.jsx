import { useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { enviarRecuperacion } from "../../services/authService";

// RF-03: solicitar la recuperacion de contrasena mediante correo.
export default function RecuperarPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

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
            <Link to="/reset-password" className="btn-primary block text-center">
              Continuar a restablecer contraseña
            </Link>
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
