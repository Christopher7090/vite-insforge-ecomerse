import insforge from "./insforgeClient";

export const listarPedidos = async () => {
  const { data, error } = await insforge.database
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const listarPedidosDeUsuario = async (usuarioId) => {
  const { data, error } = await insforge.database
    .from("orders")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const obtenerPedido = async (id) => {
  const { data, error } = await insforge.database
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const crearPedido = async ({ usuarioId, items, direccionEnvio, metodoPago }) => {
  const total = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);

  const { data: order, error: orderError } = await insforge.database
    .from("orders")
    .insert([
      {
        usuario_id: usuarioId,
        direccion_envio: direccionEnvio,
        metodo_pago: metodoPago,
        estado: "pendiente",
        fecha: new Date().toISOString().slice(0, 10),
        total,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((i) => ({
    pedido_id: order.id,
    producto_id: i.productoId,
    cantidad: i.cantidad,
    precio_unitario: i.precioUnitario,
  }));

  const { error: itemsError } = await insforge.database
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  for (const item of items) {
    const { data: prod } = await insforge.database
      .from("products")
      .select("stock")
      .eq("id", item.productoId)
      .single();
    if (prod && prod.stock >= item.cantidad) {
      await insforge.database
        .from("products")
        .update({ stock: prod.stock - item.cantidad })
        .eq("id", item.productoId);
    }
  }

  return order;
};

export const actualizarEstadoPedido = async (id, estado) => {
  const { data, error } = await insforge.database
    .from("orders")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
