-- INVENTIA: Staff Roles, Invite Codes & Orders
-- Run AFTER 002_inventory_schema.sql

-- =============================================
-- RESTAURANT STAFF
-- =============================================
CREATE TABLE IF NOT EXISTS public.restaurant_staff (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'mesero', 'chef', 'cajero', 'inventario')),
  name          TEXT,
  active        BOOL NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id)
);

-- =============================================
-- STAFF INVITE CODES (feature de pago)
-- =============================================
CREATE TABLE IF NOT EXISTS public.staff_invites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  code          TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('mesero', 'chef', 'cajero', 'inventario')),
  created_by    UUID REFERENCES auth.users(id),
  used_by       UUID REFERENCES auth.users(id),
  used_at       TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- RESTAURANT MODULES (feature flags por restaurante)
-- =============================================
CREATE TABLE IF NOT EXISTS public.restaurant_modules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  module_key    TEXT NOT NULL,
  enabled       BOOL NOT NULL DEFAULT FALSE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, module_key)
);

-- Insertar módulos por defecto para restaurantes existentes
INSERT INTO public.restaurant_modules (restaurant_id, module_key, enabled)
SELECT r.id, m.module_key, m.enabled
FROM public.restaurants r
CROSS JOIN (VALUES
  ('orders',     TRUE),
  ('staff',      FALSE),
  ('ai',         FALSE),
  ('analytics',  FALSE),
  ('payments',   FALSE)
) AS m(module_key, enabled)
ON CONFLICT (restaurant_id, module_key) DO NOTHING;

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number  INT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_kitchen', 'ready', 'paid', 'cancelled')),
  notes         TEXT,
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by    UUID REFERENCES auth.users(id),  -- mesero
  closed_by     UUID REFERENCES auth.users(id),  -- cajero
  closed_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES public.products(id),
  product_name   TEXT NOT NULL,
  quantity       NUMERIC(10,3) NOT NULL,
  unit           TEXT NOT NULL,
  price_per_unit NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal       NUMERIC(12,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- FUNCIÓN: descontar inventario al pagar orden
-- =============================================
CREATE OR REPLACE FUNCTION public.deduct_inventory_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo actuar cuando status cambia a 'paid'
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    INSERT INTO public.movements (
      restaurant_id, product_id, product_name,
      movement_type, quantity, unit, notes, user_id
    )
    SELECT
      NEW.restaurant_id,
      oi.product_id,
      oi.product_name,
      'salida',
      oi.quantity,
      oi.unit,
      'Orden #' || NEW.id::TEXT || ' - Mesa ' || NEW.table_number,
      NEW.closed_by
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id;

    -- Registrar fecha de cierre
    NEW.closed_at := NOW();
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_paid ON public.orders;
CREATE TRIGGER on_order_paid
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.deduct_inventory_on_payment();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_staff_restaurant   ON public.restaurant_staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_user         ON public.restaurant_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_code       ON public.staff_invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_restaurant ON public.staff_invites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant  ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_modules_restaurant ON public.restaurant_modules(restaurant_id);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.restaurant_staff   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_modules ENABLE ROW LEVEL SECURITY;

-- restaurant_staff: owner puede ver/gestionar su staff; staff puede verse a sí mismo
CREATE POLICY "staff_select" ON public.restaurant_staff
  FOR SELECT USING (
    user_id = auth.uid()
    OR restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "staff_insert" ON public.restaurant_staff
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "staff_update" ON public.restaurant_staff
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "staff_delete" ON public.restaurant_staff
  FOR DELETE USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

-- staff_invites: owner gestiona sus códigos
CREATE POLICY "invites_select" ON public.staff_invites
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "invites_insert" ON public.staff_invites
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

-- orders: staff del restaurante puede ver/crear
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND active = TRUE
      UNION
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND active = TRUE
      UNION
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND active = TRUE
      UNION
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- order_items: misma lógica que orders
CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      WHERE o.restaurant_id IN (
        SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND active = TRUE
        UNION
        SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT o.id FROM public.orders o
      WHERE o.restaurant_id IN (
        SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND active = TRUE
        UNION
        SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
      )
    )
  );

-- restaurant_modules: solo owner puede ver sus módulos
CREATE POLICY "modules_select" ON public.restaurant_modules
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

-- service_role bypasses RLS automáticamente
