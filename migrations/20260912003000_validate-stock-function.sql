CREATE OR REPLACE FUNCTION public.validate_stock(items jsonb)
RETURNS TABLE(producto_id uuid, stock_disponible integer, cantidad_solicitada integer)
LANGUAGE sql
STABLE
AS $$
  SELECT
    (item->>'producto_id')::uuid AS producto_id,
    p.stock AS stock_disponible,
    (item->>'cantidad')::integer AS cantidad_solicitada
  FROM jsonb_array_elements(items) AS item
  JOIN products p ON p.id = (item->>'producto_id')::uuid
  WHERE p.stock < (item->>'cantidad')::integer;
$$;
