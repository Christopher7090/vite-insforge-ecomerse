import insforge from "./insforgeClient";

export const obtenerCarrito = async () => {
  const { data, error } = await insforge.database
    .from("cart_items")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data || [];
};

export const agregarAlCarrito = async (productoId, cantidad = 1) => {
  const { data: existing } = await insforge.database
    .from("cart_items")
    .select("*")
    .eq("producto_id", productoId)
    .single();

  if (existing) {
    const { error } = await insforge.database
      .from("cart_items")
      .update({ cantidad: existing.cantidad + cantidad })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await insforge.database
      .from("cart_items")
      .insert([{ producto_id: productoId, cantidad }]);
    if (error) throw error;
  }

  return obtenerCarrito();
};

export const cambiarCantidad = async (productoId, cantidad) => {
  const { error } = await insforge.database
    .from("cart_items")
    .update({ cantidad })
    .eq("producto_id", productoId);
  if (error) throw error;
  return obtenerCarrito();
};

export const quitarDelCarrito = async (productoId) => {
  const { error } = await insforge.database
    .from("cart_items")
    .delete()
    .eq("producto_id", productoId);
  if (error) throw error;
  return obtenerCarrito();
};

export const vaciarCarrito = async () => {
  const { error } = await insforge.database.from("cart_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
};
