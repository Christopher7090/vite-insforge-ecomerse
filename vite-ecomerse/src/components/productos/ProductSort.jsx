export default function ProductSort({ orden, onOrdenChange }) {
  return (
    <div>
      <label className="field-label" htmlFor="orden">
        Ordenar por
      </label>

      <select
        id="orden"
        value={orden}
        onChange={(e) => onOrdenChange(e.target.value)}
        className="field-input"
      >
        <option value="relevancia">Más relevantes</option>
        <option value="precioAsc">Precio: menor a mayor</option>
        <option value="precioDesc">Precio: mayor a menor</option>
        <option value="nombreAsc">Nombre: A - Z</option>
        <option value="nombreDesc">Nombre: Z - A</option>
      </select>
    </div>
  );
}