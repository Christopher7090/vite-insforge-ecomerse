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
    insforge.database.from("orders").select("id, estado, total, fecha, created_at"),
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
  const { error } = await insforge.database.rpc("set_user_role", {
    p_user_id: userId,
    p_new_rol: nuevoRol,
  });
  if (error) throw error;
};

export const eliminarPedido = async (id) => {
    const { data: pedido, error: fetchError } = await insforge.database
    .from("orders")
    .select("estado")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  if(pedido?.estado == "pendiente" || pedido?.estado == "en_transito"){
    const { data: items } = await insforge.database
      .from("order_items")
      .select("producto_id, cantidad")
      .eq("pedido_id", id);

    if (items) {
      for (const item of items) {
        await insforge.database.rpc("increment_stock", {
          p_producto_id: item.producto_id,
          p_cantidad: item.cantidad,
        });
      }
    }
  }
  const { error: itemsErr } = await insforge.database
    .from("order_items")
    .delete()
    .eq("pedido_id", id);
  if (itemsErr) throw itemsErr;

  const { error } = await insforge.database.from("orders").delete().eq("id", id);
  if (error) throw error;
};

export const obtenerAnaliticas = async () => {
  const [pedidosRes, productosRes, categoriasRes, usuariosRes] = await Promise.all([
    insforge.database
      .from("orders")
      .select("id, estado, total, fecha, created_at, order_items(producto_id, cantidad, precio_unitario)"),
    insforge.database
      .from("products")
      .select("id, nombre, precio, categoria_id, categories(nombre)"),
    insforge.database.from("categories").select("id, nombre"),
    fetch(`${INSFORGE_URL}/api/auth/users?limit=1`, { headers: adminHeaders }).then((r) => r.json()),
  ]);

  if (pedidosRes.error) throw pedidosRes.error;
  if (productosRes.error) throw productosRes.error;

  return {
    pedidos: pedidosRes.data || [],
    productos: productosRes.data || [],
    categorias: categoriasRes.data || [],
    totalUsuarios: usuariosRes.pagination?.total ?? 0,
  };
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
