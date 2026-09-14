import insforge from "./insforgeClient";

const BUCKET = "product-images";

export const getImageUrl = (path) => {
  const data = insforge.storage.from(BUCKET).getPublicUrl(path);
  return data.data.publicUrl;
};

export const listarProductos = async () => {
  const { data, error } = await insforge.database
    .from("products")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return data || [];
};

export const obtenerProducto = async (id) => {
  const { data, error } = await insforge.database
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const buscarProductos = async ({ texto, categoriaId, precioMax } = {}) => {
  let query = insforge.database.from("products").select("*");

  if (texto) {
    query = query.ilike("nombre", `%${texto}%`);
  }
  if (categoriaId) {
    query = query.eq("categoria_id", categoriaId);
  }
  if (precioMax) {
    query = query.lte("precio", precioMax);
  }

  const { data, error } = await query.order("nombre");
  if (error) throw error;
  return data || [];
};

export const crearProducto = async (producto) => {
  const { data, error } = await insforge.database
    .from("products")
    .insert([producto])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const editarProducto = async (id, cambios) => {
  const { data, error } = await insforge.database
    .from("products")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const eliminarProducto = async (id) => {
  const { error } = await insforge.database.from("products").delete().eq("id", id);
  if (error) throw error;
};

export const subirImagen = async (file, productoId) => {
  const ext = file.name.split(".").pop();
  const path = `${productoId}/${Date.now()}.${ext}`;
  const { data, error } = await insforge.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return data?.key || path;
};
