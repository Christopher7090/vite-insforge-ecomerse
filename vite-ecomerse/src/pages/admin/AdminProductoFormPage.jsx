import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearProducto, editarProducto, obtenerProducto, subirImagen, getImageUrl } from "../../services/productosService";
import { listarCategorias } from "../../services/categoriasService";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

// Convierte lo guardado en BD (objeto, array o null) a la lista editable [{ id, clave, valor }]
let specId = 0;
const nuevaSpecId = () => `spec-${(specId += 1)}`;

const specsALista = (specs) => {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs.map((s) =>
      s && typeof s === "object"
        ? { id: nuevaSpecId(), clave: String(s.clave ?? s.key ?? ""), valor: String(s.valor ?? s.value ?? "") }
        : { id: nuevaSpecId(), clave: String(s), valor: "" }
    );
  }
  if (typeof specs === "object") {
    return Object.entries(specs).map(([clave, valor]) => ({ id: nuevaSpecId(), clave, valor: String(valor) }));
  }
  return [];
};

// Filtra las filas con contenido
const specsLlenas = (specs) =>
  specs.filter((s) => s.clave.trim() !== "" || s.valor.trim() !== "");

export default function AdminProductoFormPage() {
  const { id } = useParams();
  const esEdicion = !!id;
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", stock: "", categoria_id: "", specs: [] });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(esEdicion);

  useEffect(() => {
    Promise.all([
      listarCategorias(),
      esEdicion ? obtenerProducto(id) : null,
    ]).then(([cats, prod]) => {
      setCategorias(cats);
      if (prod) {
        setForm({
          nombre: prod.nombre,
          descripcion: prod.descripcion || "",
          precio: String(prod.precio),
          stock: String(prod.stock),
          categoria_id: prod.categoria_id || "",
          specs: specsALista(prod.specs),
        });
        if (prod.imagenes?.[0]) setImagenPreview(getImageUrl(prod.imagenes[0]));
      }
    }).catch(() => navigate("/admin/productos")).finally(() => setCargando(false));
  }, [id, esEdicion, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
  };

  const actualizarSpec = (index, campo, valor) => {
    const specs = form.specs.map((s, i) => (i === index ? { ...s, [campo]: valor } : s));
    setForm({ ...form, specs });
    setErrores({ ...errores, specs: "" });
  };

  const agregarSpec = () => {
    setForm({ ...form, specs: [...form.specs, { id: nuevaSpecId(), clave: "", valor: "" }] });
    setErrores({ ...errores, specs: "" });
  };

  const eliminarSpec = (id) => {
    setForm({ ...form, specs: form.specs.filter((s) => s.id !== id) });
    setErrores({ ...errores, specs: "" });
  };

  const handleImagen = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const validar = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "Requerido";
    if (!form.categoria_id) errs.categoria_id = "Seleccione una categoría";
    if (!form.precio || Number(form.precio) <= 0) errs.precio = "Precio inválido";
    if (form.stock === "" || Number(form.stock) < 0) errs.stock = "Stock inválido";
    const specsFiltradas = specsLlenas(form.specs);
    if (specsFiltradas.some((s) => !s.clave.trim())) {
      errs.specs = "Completa el nombre en todas las especificaciones";
    } else if (specsFiltradas.some((s) => !s.valor.trim())) {
      errs.specs = "Completa el valor en todas las especificaciones";
    } else if (new Set(specsFiltradas.map((s) => s.clave.trim().toLowerCase())).size !== specsFiltradas.length) {
      errs.specs = "Hay especificaciones con el mismo nombre";
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);

    try {
      const specsFiltradas = specsLlenas(form.specs);
      const specs = specsFiltradas.length
        ? Object.fromEntries(specsFiltradas.map((s) => [s.clave.trim(), s.valor.trim()]))
        : null;

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock),
        categoria_id: form.categoria_id,
        specs,
      };

      let producto;
      if (esEdicion) {
        producto = await editarProducto(id, payload);
      } else {
        producto = await crearProducto(payload);
      }

      if (imagenFile) {
        const path = await subirImagen(imagenFile, producto.id);
        await editarProducto(producto.id, { imagenes: [path] });
      }

      navigate("/admin/productos");
    } catch (err) {
      setErrores({ _form: err.message || "Error al guardar" });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-800">
        {esEdicion ? "Editar producto" : "Nuevo producto"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 card space-y-5 p-6" noValidate>
        {errores._form && <p className="text-sm text-red-600">{errores._form}</p>}

        <FormField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} required />

        <div>
          <label className="field-label" htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Precio (S/)" name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} error={errores.precio} required />
          <FormField label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} error={errores.stock} required />
        </div>

        <div>
          <label className="field-label" htmlFor="categoria_id">Categoría *</label>
          <select id="categoria_id" name="categoria_id" value={form.categoria_id} onChange={handleChange} className={`field-input ${errores.categoria_id ? "field-input-error" : ""}`}>
            <option value="">Seleccionar categoría...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errores.categoria_id && <p className="field-error">{errores.categoria_id}</p>}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label className="field-label" htmlFor={form.specs.length ? "specs-nombre" : undefined}>Especificaciones</label>
            <span className="text-xs text-slate-400">{form.specs.length > 0 ? `${form.specs.length} ${form.specs.length === 1 ? "ítem" : "ítems"}` : "Opcional"}</span>
          </div>

          {form.specs.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
              Aún no hay especificaciones. Agrega la primera con el botón de abajo.
            </p>
          )}

          <ul className="space-y-2">
            {form.specs.map((spec, index) => {
              const esNuevaVacia = spec.clave === "" && spec.valor === "";
              const esUltima = index === form.specs.length - 1;
              return (
                <li key={spec.id} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                  <span className="hidden w-6 shrink-0 select-none pt-2 text-center text-xs font-medium text-slate-400 sm:block">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2 sm:flex sm:space-y-0 sm:gap-2">
                    <input
                      id={index === 0 ? "specs-nombre" : undefined}
                      type="text"
                      value={spec.clave}
                      onChange={(e) => actualizarSpec(index, "clave", e.target.value)}
                      placeholder="Nombre (ej. Procesador)"
                      aria-label="Nombre de la especificación"
                      autoFocus={esUltima && esNuevaVacia}
                      className={`field-input sm:min-w-0 sm:flex-1 ${errores.specs ? "field-input-error" : ""}`}
                    />
                    <input
                      type="text"
                      value={spec.valor}
                      onChange={(e) => actualizarSpec(index, "valor", e.target.value)}
                      placeholder="Valor (ej. Intel i7)"
                      aria-label="Valor de la especificación"
                      className={`field-input sm:min-w-0 sm:flex-1 ${errores.specs ? "field-input-error" : ""}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarSpec(spec.id)}
                    aria-label={`Eliminar especificación ${spec.clave.trim() || index + 1}`}
                    title="Eliminar"
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>

          <Button type="button" variant="secondary" onClick={agregarSpec} className="mt-3 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Agregar especificación
          </Button>

          {errores.specs && <p className="field-error">{errores.specs}</p>}
        </div>

        <div>
          <label className="field-label">Imagen</label>
          <div className="flex items-center gap-4">
            <label className="btn-secondary cursor-pointer">
              Seleccionar imagen
              <input type="file" accept="image/*" onChange={handleImagen} className="hidden" />
            </label>
            {imagenPreview && (
              <img src={imagenPreview} alt="Preview" className="h-16 w-16 rounded-lg object-contain" />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/admin/productos")}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
