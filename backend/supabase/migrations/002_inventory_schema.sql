-- INVENTIA Inventory Schema
-- Run this AFTER 001_schema.sql in Supabase SQL Editor

-- =============================================
-- RESTAURANTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'Mi Restaurante',
  address         TEXT,
  phone           TEXT,
  email           TEXT,
  plan            TEXT NOT NULL DEFAULT 'free',
  status          TEXT NOT NULL DEFAULT 'active',
  alert_threshold INT  NOT NULL DEFAULT 20,
  notify_email    BOOL NOT NULL DEFAULT TRUE,
  notify_whatsapp BOOL NOT NULL DEFAULT FALSE,
  auto_restock    BOOL NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id  UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'General',
  quantity       NUMERIC(10,3) NOT NULL DEFAULT 0,
  unit           TEXT NOT NULL DEFAULT 'kg',
  min_threshold  NUMERIC(10,3) NOT NULL DEFAULT 0,
  max_capacity   NUMERIC(10,3) NOT NULL DEFAULT 0,
  price_per_unit NUMERIC(12,2) NOT NULL DEFAULT 0,
  supplier       TEXT,
  active         BOOL NOT NULL DEFAULT TRUE,
  last_updated   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- MOVEMENTS (inmutables — sin update/delete)
-- =============================================
CREATE TABLE IF NOT EXISTS public.movements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name  TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste')),
  quantity      NUMERIC(10,3) NOT NULL,
  unit          TEXT NOT NULL,
  notes         TEXT DEFAULT '',
  user_id       UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_restaurant  ON public.products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_active       ON public.products(restaurant_id, active);
CREATE INDEX IF NOT EXISTS idx_movements_restaurant  ON public.movements(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_movements_product     ON public.movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created     ON public.movements(created_at DESC);

-- =============================================
-- FUNCIÓN: crear restaurante al registrarse
-- =============================================
CREATE OR REPLACE FUNCTION public.create_restaurant_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.restaurants (owner_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'Mi Restaurante'),
    NEW.email
  )
  ON CONFLICT (owner_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_restaurant_on_signup();

-- =============================================
-- FUNCIÓN: aplicar movimiento al stock
-- =============================================
CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE public.products
    SET quantity = quantity + NEW.quantity, last_updated = NOW()
    WHERE id = NEW.product_id;

  ELSIF NEW.movement_type = 'salida' THEN
    UPDATE public.products
    SET quantity = GREATEST(0, quantity - NEW.quantity), last_updated = NOW()
    WHERE id = NEW.product_id;

  ELSIF NEW.movement_type = 'ajuste' THEN
    UPDATE public.products
    SET quantity = NEW.quantity, last_updated = NOW()
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_movement_insert ON public.movements;
CREATE TRIGGER on_movement_insert
  AFTER INSERT ON public.movements
  FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements   ENABLE ROW LEVEL SECURITY;

-- RESTAURANTS
DROP POLICY IF EXISTS "restaurants_select" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_insert" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_update" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_delete" ON public.restaurants;

CREATE POLICY "restaurants_select" ON public.restaurants
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "restaurants_insert" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "restaurants_update" ON public.restaurants
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "restaurants_delete" ON public.restaurants
  FOR DELETE USING (auth.uid() = owner_id);

-- PRODUCTS
DROP POLICY IF EXISTS "products_select" ON public.products;
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "products_delete" ON public.products;

CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "products_insert" ON public.products
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "products_update" ON public.products
  FOR UPDATE
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "products_delete" ON public.products
  FOR DELETE USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

-- MOVEMENTS (solo SELECT e INSERT — sin update/delete)
DROP POLICY IF EXISTS "movements_select" ON public.movements;
DROP POLICY IF EXISTS "movements_insert" ON public.movements;

CREATE POLICY "movements_select" ON public.movements
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "movements_insert" ON public.movements
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  );

-- service_role bypasses RLS automáticamente (backend usa service_role key)
