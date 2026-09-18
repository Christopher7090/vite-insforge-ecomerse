import insforge from "./insforgeClient";

const GUEST_CART_KEY = "guest_cart";

async function getAuthUser() {
  try {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (!error && data?.user) return data.user;
  } catch (err) {
    return null;
  }
  return null;
}

function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function setGuestCart(cart) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("guest-cart-updated"));
}

export function getGuestCartCount() {
  return getGuestCart().reduce((acc, i) => acc + i.cantidad, 0);
}

export function onGuestCartUpdate(callback) {
  window.addEventListener("guest-cart-updated", callback);
  return () => window.removeEventListener("guest-cart-updated", callback);
}

export const obtenerCarrito = async () => {
  const user = await getAuthUser();
  if (!user) return getGuestCart();

  const { data, error } = await insforge.database
    .from("cart_items")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data || [];
};

export const obtenerCarritobyidproducto = async (productoId) => {
  const user = await getAuthUser();
  if (!user) return getGuestCart().find((i) => i.producto_id === productoId);

  const { data, error } = await insforge.database
    .from("cart_items")
    .select("*")
    .order("created_at")
    .eq("producto_id", productoId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const agregarAlCarrito = async (productoId, cantidad = 1) => {
  const user = await getAuthUser();

  if (!user) {
    const cart = getGuestCart();
    const existing = cart.find((i) => i.producto_id === productoId);
    if (existing) {
      existing.cantidad += cantidad;
    } else {
      cart.push({ producto_id: productoId, cantidad, usuario_id: null });
    }
    setGuestCart(cart);
    return;
  }

  const { data: existing } = await insforge.database
    .from("cart_items")
    .select()
    .eq("producto_id", productoId)
    .eq("usuario_id", user.id)
    .maybeSingle();
  if (existing) {
    const { error } = await insforge.database
      .from("cart_items")
      .update({ cantidad: existing.cantidad + cantidad })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await insforge.database
      .from("cart_items")
      .insert({ producto_id: productoId, cantidad, usuario_id: user.id });
    if (error) throw error;
  }

  return;
};

export const cambiarCantidad = async (productoId, cantidad) => {
  const user = await getAuthUser();

  if (!user) {
    const cart = getGuestCart();
    const item = cart.find((i) => i.producto_id === productoId);
    if (item) item.cantidad = cantidad;
    setGuestCart(cart);
    return cart;
  }

  const { error } = await insforge.database
    .from("cart_items")
    .update({ cantidad })
    .eq("producto_id", productoId)
    .eq("usuario_id", user.id);
  if (error) throw error;
  return obtenerCarrito();
};

export const quitarDelCarrito = async (productoId) => {
  const user = await getAuthUser();

  if (!user) {
    const cart = getGuestCart().filter((i) => i.producto_id !== productoId);
    setGuestCart(cart);
    return cart;
  }

  const { error } = await insforge.database
    .from("cart_items")
    .delete()
    .eq("producto_id", productoId)
    .eq("usuario_id", user.id);
  if (error) throw error;
  return obtenerCarrito();
};

export const vaciarCarrito = async () => {
  const user = await getAuthUser();

  if (!user) {
    setGuestCart([]);
    return;
  }

  const { error } = await insforge.database
    .from("cart_items")
    .delete()
    .eq("usuario_id", user.id);
  if (error) throw error;
};

export const syncGuestCart = async (userId) => {
  const guestCart = getGuestCart();
  if (!guestCart.length || !userId) return;

  for (const item of guestCart) {
    const { data: existing } = await insforge.database
      .from("cart_items")
      .select()
      .eq("producto_id", item.producto_id)
      .eq("usuario_id", userId)
      .single();
    if (existing) {
      await insforge.database
        .from("cart_items")
        .update({ cantidad: existing.cantidad + item.cantidad })
        .eq("id", existing.id);
    } else {
      await insforge.database
        .from("cart_items")
        .insert({ producto_id: item.producto_id, cantidad: item.cantidad, usuario_id: userId });
    }
  }

  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event("guest-cart-updated"));
};
