-- ============================================================
-- INVENTIA — Inventory Schema (Supabase / PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- TABLA: restaurants
-- Un registro por usuario/dueño de restaurante
-- owner_id = auth.users.id de Supabase
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  owner_email     TEXT NOT NULL,
  owner_name      TEXT DEFAULT '',
  plan            TEXT NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free','pro','enterprise')),
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','suspended','deleted')),
  -- Settings embebidos como columnas (más eficiente que JSONB para queries)
  address         TEXT DEFAULT '',
  phone           TEXT DEFAULT '',
  contact_email   TEXT DEFAULT '',
  alert_threshold INTEGER NOT NULL DEFAULT 20
                    CHECK (alert_threshold BETWEEN 5 AND 100),
  notify_email    BOOLEAN NOT NULL DEFAULT TRUE,
  notify_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  auto_restock    BOOLEAN NOT NULL DEFAULT FALSE,
  currency        TEXT NOT NULL DEFAULT 'COP',
  timezone        TEXT NOT NULL DEFAULT 'America/Bogota',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ─────────────────────────────────────────────────────────────
-- TABLA: products
-- Inventario de cada restaurante
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL
                    CHECK (category IN (
                      'Carnes','Verduras','Lacteos','Aceites',
                      'Granos','Bebidas','Condimentos','Frutas',
                      'Mariscos','Panaderia','Limpieza','Otros'
                    )),
  quantity        NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit            TEXT NOT NULL
                    CHECK (unit IN ('kg','g','L','ml','unidad','caja','paquete','docena','lb')),
  min_threshold   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (min_threshold >= 0),
  max_capacity    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (max_capacity > 0),
  price_per_unit  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price_per_unit >= 0),
  supplier        TEXT DEFAULT '',
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLA: movements
-- Registro INMUTABLE de entradas/salidas/ajustes
-- No se permiten UPDATE ni DELETE (garantizado por RLS)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name    TEXT NOT NULL,
  movement_type   TEXT NOT NULL
                    CHECK (movement_type IN ('entrada','salida','ajuste')),
  quantity        NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  unit            TEXT NOT NULL,
  notes           TEXT DEFAULT '',
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLA: alerts
-- Alertas de stock bajo (generadas por la IA o el sistema)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name    TEXT NOT NULL,
  alert_type      TEXT NOT NULL
                    CHECK (alert_type IN ('warning','critical','info','success')),
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  resolved        BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Cada usuario solo accede a su propio restaurante y sus datos
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts      ENABLE ROW LEVEL SECURITY;

-- restaurants: el dueño solo ve y edita su restaurante
CREATE POLICY "owner_restaurants" ON public.restaurants
  FOR ALL USING (auth.uid() = owner_id);

-- products: acceso solo si el restaurante pertenece al usuario
CREATE POLICY "owner_products" ON public.products
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- movements: el usuario puede leer y crear, NUNCA actualizar/eliminar
CREATE POLICY "owner_movements_read" ON public.movements
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "owner_movements_insert" ON public.movements
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Sin UPDATE ni DELETE en movements → inmutable

-- alerts: el dueño puede leer y marcar como resueltas
CREATE POLICY "owner_alerts_read" ON public.alerts
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "owner_alerts_update" ON public.alerts
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "owner_alerts_insert" ON public.alerts
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- ÍNDICES (performance)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_restaurants_owner   ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON public.products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category   ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active     ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_movements_restaurant ON public.movements(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_movements_product   ON public.movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_type      ON public.movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_movements_date      ON public.movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_restaurant   ON public.alerts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved     ON public.alerts(resolved);

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN: actualizar updated_at automáticamente
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_products_last_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN: actualizar quantity del producto al registrar movimiento
-- Se ejecuta automáticamente al insertar en movements
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE public.products
    SET quantity = quantity + NEW.quantity,
        last_updated = NOW()
    WHERE id = NEW.product_id;

  ELSIF NEW.movement_type = 'salida' THEN
    UPDATE public.products
    SET quantity = GREATEST(0, quantity - NEW.quantity),
        last_updated = NOW()
    WHERE id = NEW.product_id;

  ELSIF NEW.movement_type = 'ajuste' THEN
    UPDATE public.products
    SET quantity = NEW.quantity,
        last_updated = NOW()
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_apply_stock_movement
  AFTER INSERT ON public.movements
  FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- ─────────────────────────────────────────────────────────────
-- FUNCIÓN: crear restaurante automáticamente al registrarse
-- Se ejecuta cuando un usuario nuevo confirma su email
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_restaurant_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.restaurants (owner_id, name, owner_email, owner_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'Mi Restaurante'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (owner_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_create_restaurant_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_restaurant_on_signup();
