import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buscarProductos } from "../../services/productosService";
import { listarCategorias } from "../../services/categoriasService";
import ProductCard from "../../components/productos/ProductCard";
import ProductSort from "../../components/productos/ProductSort";
import ProductPagination from "../../components/productos/ProductPagination";

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categorias, setCategorias] = useState([]);
  const [todosProductos, setTodosProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [texto, setTexto] = useState("");
  const categoriaId = searchParams.get("categoria") ?? "";
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("relevancia");
  const [paginaActual, setPaginaActual] = useState(1);

  const productosPorPagina = 6;

  useEffect(() => {
    async function cargar() {
      try {
        const [cats, prods] = await Promise.all([
          listarCategorias(),
          buscarProductos({
            texto: texto.trim() || undefined,
            categoriaId: categoriaId || undefined,
            precioMax: precioMax ? Number(precioMax) : undefined,
          }),
        ]);
        setCategorias(cats);
        setTodosProductos(prods);
      } catch {
        // ignore
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [texto, categoriaId, precioMax]);

  const productos = (() => {
    switch (orden) {
      case "precioAsc":
        return [...todosProductos].sort((a, b) => a.precio - b.precio);
      case "precioDesc":
        return [...todosProductos].sort((a, b) => b.precio - a.precio);
      case "nombreAsc":
        return [...todosProductos].sort((a, b) => a.nombre.localeCompare(b.nombre));
      case "nombreDesc":
        return [...todosProductos].sort((a, b) => b.nombre.localeCompare(a.nombre));
      default:
        return todosProductos;
    }
  })();

  const totalPaginas = Math.ceil(productos.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const productosPagina = productos.slice(indiceInicio, indiceInicio + productosPorPagina);

  const categoriaNombre = (id) => categorias.find((c) => c.id === id)?.nombre;

  const handleCategoria = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("categoria", id);
    else next.delete("categoria");
    setSearchParams(next);
  };

  const limpiarFiltros = () => {
    setTexto("");
    setPrecioMax("");
    setSearchParams({});
    setPaginaActual(1);
  };

  const handleCategoriaWithReset = (id) => {
    handleCategoria(id);
    setPaginaActual(1);
  };

  if (cargando) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl">Catálogo de productos</h1>
        <p className="mt-6 text-slate-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl">Catálogo de productos</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div>
            <label className="field-label" htmlFor="buscador">Buscar</label>
            <input
              id="buscador"
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nombre del producto..."
              className="field-input"
            />
          </div>

          <div>
            <p className="field-label">Categoría</p>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategoriaWithReset("")}
                className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm ${
                  !categoriaId ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoriaWithReset(cat.id)}
                  className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm ${
                    categoriaId === cat.id ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="precioMax">Precio máximo (S/)</label>
            <input
              id="precioMax"
              type="number"
              min="0"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              placeholder="Sin límite"
              className="field-input"
            />
          </div>

          <button onClick={limpiarFiltros} className="text-sm text-brand-600 hover:underline">
            Limpiar filtros
          </button>
        </aside>

        <div>
          <div className="mb-4 flex justify-end">
            <ProductSort orden={orden} onOrdenChange={(v) => { setOrden(v); setPaginaActual(1); }} />
          </div>

          <p className="mb-4 text-sm text-slate-500">{productos.length} productos encontrados</p>

          {productos.length === 0 ? (
            <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="font-medium text-slate-700">No encontramos productos con esos filtros</p>
              <button onClick={limpiarFiltros} className="text-sm text-brand-600 hover:underline">
                Quitar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {productosPagina.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    categoriaNombre={categoriaNombre(producto.categoria_id)}
                  />
                ))}
              </div>
              <ProductPagination
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onPaginaChange={setPaginaActual}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
