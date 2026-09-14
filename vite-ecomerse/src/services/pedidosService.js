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

  const stockItems = items.map((i) => ({
    producto_id: i.productoId,
    cantidad: i.cantidad,
  }));

  const { data: invalidItems, error: validateError } = await insforge.database.rpc(
    "validate_stock",
    { items: stockItems }
  );

  if (validateError) throw validateError;

  if (invalidItems && invalidItems.length > 0) {
    const details = invalidItems
      .map((i) => `Stock: ${i.stock_disponible}, solicitado: ${i.cantidad_solicitada}`)
      .join("; ");
    throw new Error(`Stock insuficiente. ${details}`);
  }

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
    try {
      await insforge.functions.invoke("decrement-stock", {
        body: { producto_id: item.productoId, cantidad: item.cantidad },
      });
    } catch {
      await insforge.database.rpc("decrement_stock", {
        p_producto_id: item.productoId,
        p_cantidad: item.cantidad,
      });
    }
  }

  return order;
};

export const actualizarEstadoPedido = async (id, estado) => {
  const { data: pedido, error: fetchError } = await insforge.database
    .from("orders")
    .select("estado")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { data, error } = await insforge.database
    .from("orders")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  if (estado === "cancelado" && pedido?.estado !== "cancelado") {
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

  return data;
};
