import insforge from "./insforgeClient";

const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL;
const API_KEY = import.meta.env.VITE_INSFORGE_API_KEY;

const adminHeaders = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
}; 

export const obtenerEstadisticas = async () => {
  const [productos, pedidos, usuariosRes, productosBajoStock] = await Promise.all([
    insforge.database.from("products").select("id", { count: "exact", head: true }),
    insforge.database.from("orders").select("*"),
    fetch(`${INSFORGE_URL}/api/auth/users?limit=1`, { headers: adminHeaders }).then((r) => r.json()),
    insforge.database.from("products").select("id, nombre, stock").lte("stock", 5).order("stock"),
  ]);

  if (productos.error) throw productos.error;
  if (pedidos.error) throw pedidos.error;

  const orders = pedidos.data || [];
  const totalIngresos = orders.reduce((acc, p) => acc + Number(p.total || 0), 0);
  const pedidosPendientes = orders.filter((o) => o.estado === "pendiente").length;
  const recientes = orders.slice(0, 5);
  return {
    totalProductos: productos.count ?? 0,
    totalPedidos: orders.length,
    totalUsuarios: usuariosRes.pagination.total ?? 0,
    totalIngresos,
    pedidosPendientes,
    productosBajoStock: productosBajoStock.data || [],
    pedidosRecientes: recientes,
  };
};

export const listarUsuarios = async (search = "", offset = 0, limit = 50) => {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (search) params.set("search", search);

  const res = await fetch(`${INSFORGE_URL}/api/auth/users?${params}`, {
    headers: adminHeaders,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error listing users: ${res.status}`);
  }
  const data = await res.json();
  return data.data || data || [];
};

export const obtenerUsuario = async (id) => {
  const res = await fetch(`${INSFORGE_URL}/api/auth/users/${id}`, {
    headers: adminHeaders,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || data;
};

export const cambiarRolUsuario = async (userId, nuevoRol) => {
  const res = await fetch(`${INSFORGE_URL}/api/auth/profiles/${userId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({ profile: { rol: nuevoRol } }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error updating role: ${res.status}`);
  }
  return await res.json();
};

export const eliminarPedido = async (id) => {
  const { error: itemsErr } = await insforge.database
    .from("order_items")
    .delete()
    .eq("pedido_id", id);
  if (itemsErr) throw itemsErr;

  const { error } = await insforge.database.from("orders").delete().eq("id", id);
  if (error) throw error;
};

export const eliminarUsuarios = async (userIds) => {
  const res = await fetch(`${INSFORGE_URL}/api/auth/users`, {
    method: "DELETE",
    headers: adminHeaders,
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error deleting users: ${res.status}`);
  }
  return await res.json();
};
