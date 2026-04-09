"""
INVENTIA — Seed completo de Supabase
Crea usuarios demo, restaurantes, productos y movimientos
Ejecutar: python setup_supabase.py
"""
import sys, os, random
from datetime import datetime, timedelta

os.environ['PYTHONIOENCODING'] = 'utf-8'
sys.path.insert(0, '.')
from config import settings
from supabase import create_client

print("=" * 60)
print("  INVENTIA — Setup Supabase")
print("=" * 60)

if not settings.supabase_url or not settings.supabase_service_key:
    print("ERROR: SUPABASE_URL y SUPABASE_SERVICE_KEY requeridos en .env")
    sys.exit(1)

sb = create_client(settings.supabase_url, settings.supabase_service_key)
print(f"[OK] Conectado a Supabase: {settings.supabase_url}\n")

now = datetime.now()

# ─────────────────────────────────────────────────────
# USUARIOS DEMO
# ─────────────────────────────────────────────────────
users_demo = [
    {
        "email": "carlos@lacasadelsabor.com",
        "password": "Inventia2026!",
        "full_name": "Carlos Garcia",
        "restaurant_name": "La Casa del Sabor",
    },
    {
        "email": "ana@rinconpaisa.com",
        "password": "Inventia2026!",
        "full_name": "Ana Morales",
        "restaurant_name": "El Rincon Paisa",
    },
]

restaurant_ids = {}

for u in users_demo:
    print(f"Creando usuario: {u['email']}")
    try:
        resp = sb.auth.admin.create_user({
            "email": u["email"],
            "password": u["password"],
            "email_confirm": True,
            "user_metadata": {
                "full_name": u["full_name"],
                "restaurant_name": u["restaurant_name"],
            }
        })
        user_id = resp.user.id
        print(f"  [OK] Usuario creado: {user_id}")

        # El trigger ya debio crear el restaurante — verificar
        import time; time.sleep(1)
        rest = sb.table("restaurants").select("id").eq("owner_id", user_id).execute()
        if rest.data:
            restaurant_ids[u["restaurant_name"]] = rest.data[0]["id"]
            print(f"  [OK] Restaurante auto-creado: {rest.data[0]['id']}")
        else:
            # Crear manualmente si el trigger no corrió
            new_rest = sb.table("restaurants").insert({
                "owner_id": user_id,
                "name": u["restaurant_name"],
                "owner_email": u["email"],
                "owner_name": u["full_name"],
            }).execute()
            restaurant_ids[u["restaurant_name"]] = new_rest.data[0]["id"]
            print(f"  [OK] Restaurante creado manualmente: {new_rest.data[0]['id']}")

    except Exception as e:
        if "already" in str(e).lower():
            print(f"  [!] Usuario ya existe, buscando restaurante...")
            # Buscar por email en restaurants
            existing = sb.table("restaurants").select("id, name")\
                .eq("owner_email", u["email"]).execute()
            if existing.data:
                restaurant_ids[u["restaurant_name"]] = existing.data[0]["id"]
                print(f"  [OK] Restaurante encontrado: {existing.data[0]['id']}")
        else:
            print(f"  [ERROR] {e}")

# ─────────────────────────────────────────────────────
# PRODUCTOS
# ─────────────────────────────────────────────────────
products_base = [
    {"name":"Pollo entero",     "category":"Carnes",     "quantity":45.0, "unit":"kg",     "min_threshold":20.0, "max_capacity":100.0, "price_per_unit":8500,  "supplier":"Carnes Premium S.A."},
    {"name":"Carne de res",     "category":"Carnes",     "quantity":30.0, "unit":"kg",     "min_threshold":15.0, "max_capacity":80.0,  "price_per_unit":22000, "supplier":"Frigorifico Central"},
    {"name":"Cerdo lomo",       "category":"Carnes",     "quantity":18.0, "unit":"kg",     "min_threshold":10.0, "max_capacity":50.0,  "price_per_unit":14000, "supplier":"Carnes Premium S.A."},
    {"name":"Tomate",           "category":"Verduras",   "quantity":25.0, "unit":"kg",     "min_threshold":10.0, "max_capacity":60.0,  "price_per_unit":3200,  "supplier":"Corabastos Directo"},
    {"name":"Cebolla cabezona", "category":"Verduras",   "quantity":8.0,  "unit":"kg",     "min_threshold":5.0,  "max_capacity":40.0,  "price_per_unit":2800,  "supplier":"Corabastos Directo"},
    {"name":"Papa pastusa",     "category":"Verduras",   "quantity":60.0, "unit":"kg",     "min_threshold":25.0, "max_capacity":150.0, "price_per_unit":1800,  "supplier":"Corabastos Directo"},
    {"name":"Platano maduro",   "category":"Verduras",   "quantity":40.0, "unit":"unidad", "min_threshold":20.0, "max_capacity":100.0, "price_per_unit":800,   "supplier":"Frutas del Valle"},
    {"name":"Leche entera",     "category":"Lacteos",    "quantity":30.0, "unit":"L",      "min_threshold":10.0, "max_capacity":60.0,  "price_per_unit":2900,  "supplier":"Alpina Distribuciones"},
    {"name":"Queso campesino",  "category":"Lacteos",    "quantity":5.0,  "unit":"kg",     "min_threshold":3.0,  "max_capacity":20.0,  "price_per_unit":18000, "supplier":"Alpina Distribuciones"},
    {"name":"Aceite vegetal",   "category":"Aceites",    "quantity":12.0, "unit":"L",      "min_threshold":5.0,  "max_capacity":30.0,  "price_per_unit":8500,  "supplier":"Granos y Aceites Ltda."},
    {"name":"Arroz blanco",     "category":"Granos",     "quantity":80.0, "unit":"kg",     "min_threshold":30.0, "max_capacity":200.0, "price_per_unit":3500,  "supplier":"Granos y Aceites Ltda."},
    {"name":"Frijol rojo",      "category":"Granos",     "quantity":20.0, "unit":"kg",     "min_threshold":8.0,  "max_capacity":50.0,  "price_per_unit":6200,  "supplier":"Granos y Aceites Ltda."},
    {"name":"Agua mineral",     "category":"Bebidas",    "quantity":120.0,"unit":"unidad", "min_threshold":48.0, "max_capacity":300.0, "price_per_unit":1500,  "supplier":"Postobón S.A."},
    {"name":"Gaseosa 2L",       "category":"Bebidas",    "quantity":36.0, "unit":"unidad", "min_threshold":12.0, "max_capacity":100.0, "price_per_unit":7200,  "supplier":"Postobón S.A."},
    {"name":"Sal marina",       "category":"Condimentos","quantity":10.0, "unit":"kg",     "min_threshold":3.0,  "max_capacity":25.0,  "price_per_unit":900,   "supplier":"Condimentos del Sur"},
    {"name":"Comino molido",    "category":"Condimentos","quantity":2.0,  "unit":"kg",     "min_threshold":0.5,  "max_capacity":5.0,   "price_per_unit":12000, "supplier":"Condimentos del Sur"},
]

notes_map = {
    "entrada": ["Compra semanal","Pedido urgente","Reposicion stock","Entrega proveedor"],
    "salida":  ["Consumo cocina","Servicio almuerzo","Pedido especial","Merma diaria"],
    "ajuste":  ["Inventario fisico","Correccion conteo","Ajuste por vencimiento"],
}

for rest_name, rest_id in restaurant_ids.items():
    print(f"\n{'─'*60}")
    print(f"  Restaurante: {rest_name} ({rest_id})")
    print(f"{'─'*60}")

    product_ids = []
    for p in products_base:
        qty = round(p["quantity"] * random.uniform(0.8, 1.2), 2)
        prod_data = {**p, "quantity": qty, "restaurant_id": rest_id}
        result = sb.table("products").insert(prod_data).execute()
        pid = result.data[0]["id"]
        product_ids.append((pid, p))
        print(f"  [+] {p['name']:<22} qty={qty} {p['unit']}")

    print(f"\n  [OK] {len(product_ids)} productos creados")

    # Movimientos (últimos 30 días)
    total_mov = 0
    movements_batch = []
    for pid, prod in product_ids:
        for _ in range(random.randint(5, 12)):
            mov_type = random.choices(
                ["entrada","salida","salida","salida","ajuste"],
                weights=[2, 5, 5, 5, 1]
            )[0]
            qty_mov = round(random.uniform(
                prod["min_threshold"] * 0.1,
                prod["min_threshold"] * 0.6
            ), 2)
            days_ago = random.randint(0, 30)
            movements_batch.append({
                "restaurant_id": rest_id,
                "product_id":    pid,
                "product_name":  prod["name"],
                "movement_type": mov_type,
                "quantity":      max(0.1, qty_mov),
                "unit":          prod["unit"],
                "notes":         random.choice(notes_map[mov_type]),
                "created_at":    (now - timedelta(days=days_ago,
                                  hours=random.randint(0,23))).isoformat(),
            })
            total_mov += 1

    # Insertar en lotes de 50
    for i in range(0, len(movements_batch), 50):
        sb.table("movements").insert(movements_batch[i:i+50]).execute()

    print(f"  [OK] {total_mov} movimientos insertados")

# ─────────────────────────────────────────────────────
# VERIFICACION
# ─────────────────────────────────────────────────────
print(f"\n{'='*60}")
print("  VERIFICACION FINAL")
print(f"{'='*60}")
for rest_name, rest_id in restaurant_ids.items():
    prods = sb.table("products").select("id", count="exact").eq("restaurant_id", rest_id).execute()
    movs  = sb.table("movements").select("id", count="exact").eq("restaurant_id", rest_id).execute()
    print(f"\n  {rest_name}")
    print(f"  Productos  : {prods.count}")
    print(f"  Movimientos: {movs.count}")

print(f"\n{'='*60}")
print("  SUPABASE LISTO")
print(f"  URL: {settings.supabase_url}")
print(f"{'='*60}")
print("\nSiguiente paso:")
print("  python main.py  →  http://localhost:8000/health")
print("  Debe retornar:  supabase: 'connected'\n")
