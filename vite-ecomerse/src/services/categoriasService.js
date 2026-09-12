import insforge from "./insforgeClient";

export const listarCategorias = async () => {
  const { data, error } = await insforge.database
    .from("categories")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return data || [];
};

export const crearCategoria = async (categoria) => {
  const { data, error } = await insforge.database
    .from("categories")
    .insert([categoria])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const editarCategoria = async (id, cambios) => {
  const { data, error } = await insforge.database
    .from("categories")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const eliminarCategoria = async (id) => {
  const { error } = await insforge.database.from("categories").delete().eq("id", id);
  if (error) throw error;
};
