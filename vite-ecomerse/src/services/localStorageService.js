// Servicio generico de acceso a localStorage.
// TODOS los demas services (productos, carrito, usuarios, pedidos, favoritos)
// se apoyan en estas funciones. Nadie deberia llamar a localStorage directamente
// desde un componente: siempre a traves de un service.

// Lee una lista guardada bajo `key`. Si es la primera vez que se usa,
// la inicializa con `datosPorDefecto` (normalmente el JSON mock importado).
export function getAll(key, datosPorDefecto = []) {
  const raw = localStorage.getItem(key);
  if (raw === null) {
    localStorage.setItem(key, JSON.stringify(datosPorDefecto));
    return datosPorDefecto;
  }
  return JSON.parse(raw);
}

// Reemplaza la lista completa guardada bajo `key`.
export function saveAll(key, lista) {
  localStorage.setItem(key, JSON.stringify(lista));
}

// Busca un elemento por id dentro de la lista guardada bajo `key`.
export function getById(key, id) {
  return getAll(key).find((item) => item.id === id) ?? null;
}

// Agrega un elemento nuevo. Si no trae id, se genera uno automaticamente.
export function addItem(key, item) {
  const lista = getAll(key);
  const nuevo = { id: item.id ?? generarId(), ...item };
  lista.push(nuevo);
  saveAll(key, lista);
  return nuevo;
}

// Actualiza (merge parcial) el elemento con ese id. Devuelve el elemento
// actualizado, o null si no existia.
export function updateItem(key, id, cambios) {
  const lista = getAll(key);
  const idx = lista.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  lista[idx] = { ...lista[idx], ...cambios };
  saveAll(key, lista);
  return lista[idx];
}

// Elimina el elemento con ese id.
export function removeItem(key, id) {
  const lista = getAll(key).filter((item) => item.id !== id);
  saveAll(key, lista);
}

// Genera un id simple y unico. Suficiente para datos temporales en el
// navegador (cuando conecten con Spring Boot, el backend generara los ids reales).
export function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
