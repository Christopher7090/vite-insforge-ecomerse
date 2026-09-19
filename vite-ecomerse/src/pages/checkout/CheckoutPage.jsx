import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { obtenerCarrito, vaciarCarrito } from "../../services/carritoService";
import { obtenerProducto } from "../../services/productosService";
import { crearPedido } from "../../services/pedidosService";
import { crearCheckoutSession } from "../../services/pagoService";
import { useAuth } from "../../contexts/AuthContext";
import insforge from "../../services/insforgeClient";

const METODOS_PAGO = [
  { id: "stripe", label: "Tarjeta de crédito / débito (Stripe)" },
  { id: "yape", label: "Yape / Plin" },
  { id: "contraentrega", label: "Pago contra entrega" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ direccion: "", metodoPago: "stripe" });
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const carrito = await obtenerCarrito();
        const itemsConProd = [];
        for (const item of carrito) {
          try {
            const prod = await obtenerProducto(item.producto_id);
            itemsConProd.push({ ...item, producto: prod });
          } catch {
            // skip
          }
        }
        setItems(itemsConProd);
        setForm({ direccion: profile?.direccion || "", metodoPago: "stripe" });
      } catch {
        // ignore
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [profile]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl">Finalizar compra</h1>
        <p className="mt-6 text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.direccion.trim()) {
      setError("Ingresa una dirección de envío");
      return;
    }

    setProcesando(true);
    try {
      const pedido = await crearPedido({
        usuarioId: user.id,
        items: items.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          precioUnitario: i.producto.precio,
        })),
        direccionEnvio: form.direccion.trim(),
        metodoPago: form.metodoPago === "stripe" ? "Tarjeta de crédito" : METODOS_PAGO.find((m) => m.id === form.metodoPago)?.label || form.metodoPago,
      });

      if (form.metodoPago === "stripe") {
        const sessionData = await crearCheckoutSession({
          pedidoId: pedido.id,
          items: items.map((i) => ({
            productoId: i.producto.id,
            cantidad: i.cantidad,
            usuarioId: user.id,
          })),
          userEmail: user.email,
        });

        await vaciarCarrito();

        if (sessionData?.checkoutSession?.url) {
          window.location.assign(sessionData.checkoutSession.url);
        }
        return;
      }

      await vaciarCarrito();

      insforge.emails.send({
        to: user.email,
        subject: `Pedido #${pedido.id} confirmado`,
        html: `
          <h1>¡Gracias por tu compra!</h1>
          <p>Tu pedido <strong>#${pedido.id}</strong> fue registrado correctamente.</p>
          <p><strong>Dirección de envío:</strong> ${form.direccion.trim()}</p>
          <p><strong>Método de pago:</strong> ${METODOS_PAGO.find((m) => m.id === form.metodoPago)?.label || form.metodoPago}</p>
          <hr/>
          <p><strong>Productos:</strong></p>
          <ul>${items.map((i) => `<li>${i.producto.nombre} x ${i.cantidad} — S/ ${(i.producto.precio * i.cantidad).toFixed(2)}</li>`).join("")}</ul>
          <p><strong>Total: S/ ${total.toFixed(2)}</strong></p>
        `,
      }).catch(() => {});

      navigate("/pedido/confirmacion", { state: { pedidoId: pedido.id } });
    } catch (err) {
      setError(err.message || "Error al procesar el pedido");
      setProcesando(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl">Finalizar compra</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="card space-y-5 p-6" noValidate>
          <FormField
            label="Dirección de envío"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            error={error}
            placeholder="Av. Siempre Viva 123, Lima"
            required
          />

          <div>
            <label className="field-label" htmlFor="metodoPago">Método de pago</label>
            <select
              id="metodoPago"
              name="metodoPago"
              value={form.metodoPago}
              onChange={handleChange}
              className="field-input"
            >
              {METODOS_PAGO.map((metodo) => (
                <option key={metodo.id} value={metodo.id}>{metodo.label}</option>
              ))}
            </select>
          </div>

          {form.metodoPago === "stripe" && (
            <p className="text-xs text-slate-500">
              Serás redirigido a Stripe para completar el pago de forma segura.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={procesando}>
            {procesando
              ? "Procesando..."
              : form.metodoPago === "stripe"
                ? "Pagar con Stripe"
                : "Confirmar pedido"}
          </Button>
        </form>

        <div className="card h-fit p-6">
          <h2 className="text-lg">Resumen del pedido</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span>{i.producto.nombre} × {i.cantidad}</span>
                <span className="shrink-0">S/ {(i.producto.precio * i.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-brand-800">
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
