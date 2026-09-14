CREATE OR REPLACE FUNCTION public.decrement_stock(p_producto_id uuid, p_cantidad integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  new_stock integer;
BEGIN
  UPDATE products
  SET stock = stock - p_cantidad
  WHERE id = p_producto_id AND stock >= p_cantidad
  RETURNING stock INTO new_stock;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock' USING ERRCODE = 'check_violation';
  END IF;

  RETURN new_stock;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_stock(p_producto_id uuid, p_cantidad integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  new_stock integer;
BEGIN
  UPDATE products
  SET stock = stock + p_cantidad
  WHERE id = p_producto_id
  RETURNING stock INTO new_stock;

  RETURN new_stock;
END;
$$;
