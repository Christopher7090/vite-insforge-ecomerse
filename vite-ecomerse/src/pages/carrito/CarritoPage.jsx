import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { getImageUrl } from "../../services/productosService";
import {
  obtenerCarrito,
  cambiarCantidad,
  quitarDelCarrito,
  vaciarCarrito,
} from "../../services/carritoService";
import { obtenerProducto } from "../../services/productosService";

export default function CarritoPage() {
  const [itemsConProducto, setItemsConProducto] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarCarrito();
  }, []);

  async function cargarCarrito() {
    try {
      const carrito = await obtenerCarrito();
      const itemsConProd = [];
      for (const item of carrito) {
        try {
          const prod = await obtenerProducto(item.producto_id);
          itemsConProd.push({ ...item, producto: prod });
        } catch {
          // skip broken items
        }
      }
      setItemsConProducto(itemsConProd);
    } catch {
      // ignore
    } finally {
      setCargando(false);
    }
  }

  const subtotal = itemsConProducto.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);

  const handleCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    await cambiarCantidad(productoId, nuevaCantidad);
    await cargarCarrito();
  };

  const handleQuitar = async (productoId) => {
    await quitarDelCarrito(productoId);
    await cargarCarrito();
  };

  const handleVaciar = async () => {
    await vaciarCarrito();
    setItemsConProducto([]);
  };

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl">Tu carrito</h1>
        <p className="mt-6 text-slate-500">Cargando carrito...</p>
      </div>
    );
  }

  if (itemsConProducto.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl">Tu carrito está vacío</h1>
        <p className="mt-2 text-slate-500">Agrega productos desde el catálogo para verlos aquí.</p>
        <Link to="/catalogo" className="btn-primary mt-6">Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl">Tu carrito</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {itemsConProducto.map(({ id, cantidad, producto }) => {
              const imagenUrl = getImageUrl(producto.imagenes?.[0]);
            return(
            <div key={id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[10px] text-brand-300" onClick={() => navigate(`/producto/${producto.id}`)}>
                {imagenUrl ? (
            <img src={imagenUrl} alt={producto.nombre} className="h-full w-full object-contain" />
          ) : (
            <span className="text-sm text-brand-300">Imagen del producto</span>
          )}
              </div>
              <div className="min-w-[140px] flex-1">
                <p className="font-medium text-slate-800" onClick={() => navigate(`/producto/${producto.id}`)}>{producto.nombre}</p>
                <p className="text-sm text-slate-500">S/ {Number(producto.precio).toFixed(2)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCantidad(producto.id, cantidad - 1)} disabled={cantidad <= 1} className="btn-secondary px-2.5 py-1" aria-label="Disminuir cantidad">−</button>
                <span className="w-6 text-center text-sm">{cantidad}</span>
                <button onClick={() => handleCantidad(producto.id, cantidad + 1)} disabled={cantidad >= producto.stock} className="btn-secondary px-2.5 py-1" aria-label="Aumentar cantidad">+</button>
              </div>
              <p className="w-24 text-right text-sm font-semibold text-brand-800">
                S/ {(Number(producto.precio) * cantidad).toFixed(2)}
              </p>
              <button onClick={() => handleQuitar(producto.id)} className="text-sm text-red-500 hover:underline">Quitar</button>
            </div>
          )})}
          <button onClick={handleVaciar} className="text-sm text-slate-500 hover:underline">Vaciar carrito</button>
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-lg">Resumen</h2>
          <div className="mt-4 flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex justify-between text-lg font-semibold text-brand-800">
            <span>Total</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <Button className="mt-6 w-full" onClick={() => navigate("/checkout")}>Proceder al pago</Button>
        </div>
      </div>
    </div>
  );
}
