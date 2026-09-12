-- ============================================
-- E-Commerce Database Schema for TechStore
-- ============================================

-- ============================================
-- 1. CATEGORIES
-- ============================================
CREATE TABLE public.categories (
  id         text PRIMARY KEY,
  nombre     text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

-- ============================================
-- 2. PRODUCTS
-- ============================================
CREATE TABLE public.products (
  id           text PRIMARY KEY,
  nombre       text NOT NULL,
  categoria_id text NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  precio       numeric(10,2) NOT NULL CHECK (precio >= 0),
  stock        integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagenes     jsonb DEFAULT '[]'::jsonb,
  descripcion  text,
  specs        jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_products_categoria ON public.products(categoria_id);
CREATE INDEX idx_products_precio ON public.products(precio);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_public" ON public.products
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- ============================================
-- 3. ORDERS
-- ============================================
CREATE TABLE public.orders (
  id              text PRIMARY KEY,
  usuario_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  direccion_envio text NOT NULL,
  metodo_pago     text NOT NULL,
  estado          text NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_transito', 'entregado', 'cancelado')),
  fecha           date NOT NULL DEFAULT CURRENT_DATE,
  total           numeric(10,2) NOT NULL CHECK (total >= 0),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_usuario ON public.orders(usuario_id);
CREATE INDEX idx_orders_estado ON public.orders(estado);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own_or_admin" ON public.orders
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "orders_delete_admin" ON public.orders
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT UPDATE, DELETE ON public.orders TO authenticated;

-- ============================================
-- 4. ORDER ITEMS
-- ============================================
CREATE TABLE public.order_items (
  id              text PRIMARY KEY,
  pedido_id       text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  producto_id     text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric(10,2) NOT NULL CHECK (precio_unitario >= 0),
  UNIQUE(pedido_id, producto_id)
);

CREATE INDEX idx_order_items_pedido ON public.order_items(pedido_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select_own_or_admin" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.pedido_id
        AND (
          public.orders.usuario_id = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  );

CREATE POLICY "order_items_insert_own_or_admin" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.pedido_id
        AND (
          public.orders.usuario_id = auth.uid()
          OR public.get_user_role() = 'admin'
        )
    )
  );

CREATE POLICY "order_items_update_admin" ON public.order_items
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "order_items_delete_admin" ON public.order_items
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT UPDATE, DELETE ON public.order_items TO authenticated;

-- ============================================
-- 5. CART ITEMS (server-side cart)
-- ============================================
CREATE TABLE public.cart_items (
  id          text PRIMARY KEY,
  usuario_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  cantidad    integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(usuario_id, producto_id)
);

CREATE INDEX idx_cart_items_usuario ON public.cart_items(usuario_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_select_own" ON public.cart_items
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "cart_items_insert_own" ON public.cart_items
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "cart_items_update_own" ON public.cart_items
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "cart_items_delete_own" ON public.cart_items
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;

-- ============================================
-- 6. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. SEED DATA — Categories
-- ============================================
INSERT INTO public.categories (id, nombre) VALUES
  ('c001', 'Laptops'),
  ('c002', 'PCs de escritorio'),
  ('c003', 'Perifericos'),
  ('c004', 'Componentes')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. SEED DATA — Products
-- ============================================
INSERT INTO public.products (id, nombre, categoria_id, precio, stock, imagenes, descripcion, specs) VALUES
  ('p001', 'Laptop Lenovo IdeaPad 3', 'c001', 2499.90, 12,
    '["p001/product.svg"]'::jsonb,
    'Laptop ligera para uso diario y estudio, buena autonomia de bateria.',
    '{"procesador":"AMD Ryzen 5 5500U","ram":"8GB","almacenamiento":"512GB SSD","pantalla":"15.6 pulgadas FHD"}'::jsonb),

  ('p002', 'Laptop ASUS ROG Strix G16', 'c001', 6899.00, 5,
    '["p002/product.svg"]'::jsonb,
    'Laptop gamer de alto rendimiento con tarjeta grafica dedicada.',
    '{"procesador":"Intel Core i7-13650HX","ram":"16GB","almacenamiento":"1TB SSD","gpu":"RTX 4060"}'::jsonb),

  ('p003', 'PC de escritorio HP Pavilion', 'c002', 3199.00, 8,
    '["p003/product.svg"]'::jsonb,
    'PC de escritorio para oficina y uso multimedia.',
    '{"procesador":"Intel Core i5-13400","ram":"16GB","almacenamiento":"512GB SSD"}'::jsonb),

  ('p004', 'Mouse inalambrico Logitech M170', 'c003', 39.90, 50,
    '["p004/product.svg"]'::jsonb,
    'Mouse inalambrico compacto, ideal para uso diario.',
    '{"conexion":"USB inalambrico","dpi":"1000"}'::jsonb),

  ('p005', 'Teclado mecanico Redragon Kumara', 'c003', 129.90, 20,
    '["p005/product.svg"]'::jsonb,
    'Teclado mecanico compacto con retroiluminacion.',
    '{"switches":"Blue","conexion":"USB"}'::jsonb),

  ('p006', 'Memoria RAM Kingston Fury 16GB', 'c004', 219.00, 30,
    '["p006/product.svg"]'::jsonb,
    'Memoria RAM DDR4 para actualizar tu PC.',
    '{"capacidad":"16GB","tipo":"DDR4","velocidad":"3200MHz"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
