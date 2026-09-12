import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearProducto, editarProducto, obtenerProducto, subirImagen, getImageUrl } from "../../services/productosService";
import { listarCategorias } from "../../services/categoriasService";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

export default function AdminProductoFormPage() {
  const { id } = useParams();
  const esEdicion = !!id;
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", stock: "", categoria_id: "", specs: "" });
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
          specs: prod.specs ? JSON.stringify(prod.specs, null, 2) : "",
        });
        if (prod.imagenes?.[0]) setImagenPreview(getImageUrl(prod.imagenes[0]));
      }
    }).catch(() => navigate("/admin/productos")).finally(() => setCargando(false));
  }, [id, esEdicion, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
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
    if (form.specs.trim()) {
      try {
        JSON.parse(form.specs);
      } catch {
        errs.specs = "JSON inválido";
      }
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);

    try {
      let specs = null;
      if (form.specs.trim()) {
        specs = JSON.parse(form.specs);
      }

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
          <label className="field-label" htmlFor="specs">Especificaciones (JSON)</label>
          <textarea
            id="specs"
            name="specs"
            value={form.specs}
            onChange={handleChange}
            rows={4}
            placeholder={'{"procesador":"Intel i7","ram":"16GB","almacenamiento":"512GB SSD"}'}
            className={`field-input font-mono text-xs ${errores.specs ? "field-input-error" : ""}`}
          />
          {errores.specs && <p className="field-error">{errores.specs}</p>}
          <p className="mt-1 text-xs text-slate-400">Formato JSON con pares clave-valor</p>
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
