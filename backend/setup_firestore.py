"""
INVENTIA — Setup completo de Firestore
Crea estructura, datos demo y verifica la conexion
"""
import sys
import os
from datetime import datetime, timedelta
import random

sys.path.insert(0, '.')
os.environ['PYTHONIOENCODING'] = 'utf-8'

from config import settings
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth

# ─────────────────────────────────────────
# INICIALIZAR FIREBASE
# ─────────────────────────────────────────
print("=" * 55)
print("  INVENTIA — Setup Firestore")
print("=" * 55)

if not firebase_admin._apps:
    cred = credentials.Certificate(settings.firebase_credentials_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()
print("[OK] Conexion a Firestore establecida")
print(f"     Proyecto: {settings.firebase_project_id}\n")

now = datetime.now()

# ─────────────────────────────────────────
# RESTAURANTES DEMO
# ─────────────────────────────────────────
restaurants_data = [
    {
        "uid": "rest_demo_001",
        "name": "La Casa del Sabor",
        "owner_uid": "rest_demo_001",
        "owner_email": "carlos@lacasadelsabor.com",
        "owner_name": "Carlos Garcia",
        "created_at": (now - timedelta(days=90)).isoformat(),
        "plan": "pro",
        "status": "active",
        "settings": {
            "name": "La Casa del Sabor",
            "address": "Calle 72 # 10-34, Bogota",
            "phone": "+57 300 111 2233",
            "email": "contacto@lacasadelsabor.com",
            "alert_threshold": 20,
            "notify_email": True,
            "notify_whatsapp": False,
            "auto_restock": False,
            "currency": "COP",
            "timezone": "America/Bogota",
        }
    },
    {
        "uid": "rest_demo_002",
        "name": "El Rincon Paisa",
        "owner_uid": "rest_demo_002",
        "owner_email": "ana@rinconpaisa.com",
        "owner_name": "Ana Morales",
        "created_at": (now - timedelta(days=45)).isoformat(),
        "plan": "free",
        "status": "active",
        "settings": {
            "name": "El Rincon Paisa",
            "address": "Carrera 43A # 1-50, Medellin",
            "phone": "+57 311 444 5566",
            "email": "info@rinconpaisa.com",
            "alert_threshold": 15,
            "notify_email": True,
            "notify_whatsapp": True,
            "auto_restock": False,
            "currency": "COP",
            "timezone": "America/Bogota",
        }
    }
]

# ─────────────────────────────────────────
# PRODUCTOS POR RESTAURANTE
# ─────────────────────────────────────────
products_template = [
    # Carnes
    {
        "name": "Pollo entero",
        "category": "Carnes",
        "quantity": 45.0,
        "unit": "kg",
        "min_threshold": 20.0,
        "max_capacity": 100.0,
        "price_per_unit": 8500,
        "supplier": "Carnes Premium S.A.",
    },
    {
        "name": "Carne de res",
        "category": "Carnes",
        "quantity": 30.0,
        "unit": "kg",
        "min_threshold": 15.0,
        "max_capacity": 80.0,
        "price_per_unit": 22000,
        "supplier": "Frigorífico Central",
    },
    {
        "name": "Cerdo lomo",
        "category": "Carnes",
        "quantity": 18.0,
        "unit": "kg",
        "min_threshold": 10.0,
        "max_capacity": 50.0,
        "price_per_unit": 14000,
        "supplier": "Carnes Premium S.A.",
    },
    # Verduras
    {
        "name": "Tomate",
        "category": "Verduras",
        "quantity": 25.0,
        "unit": "kg",
        "min_threshold": 10.0,
        "max_capacity": 60.0,
        "price_per_unit": 3200,
        "supplier": "Corabastos Directo",
    },
    {
        "name": "Cebolla cabezona",
        "category": "Verduras",
        "quantity": 8.0,
        "unit": "kg",
        "min_threshold": 5.0,
        "max_capacity": 40.0,
        "price_per_unit": 2800,
        "supplier": "Corabastos Directo",
    },
    {
        "name": "Papa pastusa",
        "category": "Verduras",
        "quantity": 60.0,
        "unit": "kg",
        "min_threshold": 25.0,
        "max_capacity": 150.0,
        "price_per_unit": 1800,
        "supplier": "Corabastos Directo",
    },
    {
        "name": "Platano maduro",
        "category": "Verduras",
        "quantity": 40.0,
        "unit": "unidad",
        "min_threshold": 20.0,
        "max_capacity": 100.0,
        "price_per_unit": 800,
        "supplier": "Frutas del Valle",
    },
    # Lacteos
    {
        "name": "Leche entera",
        "category": "Lacteos",
        "quantity": 30.0,
        "unit": "L",
        "min_threshold": 10.0,
        "max_capacity": 60.0,
        "price_per_unit": 2900,
        "supplier": "Alpina Distribuciones",
    },
    {
        "name": "Queso campesino",
        "category": "Lacteos",
        "quantity": 5.0,
        "unit": "kg",
        "min_threshold": 3.0,
        "max_capacity": 20.0,
        "price_per_unit": 18000,
        "supplier": "Alpina Distribuciones",
    },
    # Aceites y grasas
    {
        "name": "Aceite vegetal",
        "category": "Aceites",
        "quantity": 12.0,
        "unit": "L",
        "min_threshold": 5.0,
        "max_capacity": 30.0,
        "price_per_unit": 8500,
        "supplier": "Granos y Aceites Ltda.",
    },
    # Granos
    {
        "name": "Arroz blanco",
        "category": "Granos",
        "quantity": 80.0,
        "unit": "kg",
        "min_threshold": 30.0,
        "max_capacity": 200.0,
        "price_per_unit": 3500,
        "supplier": "Granos y Aceites Ltda.",
    },
    {
        "name": "Frijol rojo",
        "category": "Granos",
        "quantity": 20.0,
        "unit": "kg",
        "min_threshold": 8.0,
        "max_capacity": 50.0,
        "price_per_unit": 6200,
        "supplier": "Granos y Aceites Ltda.",
    },
    # Bebidas
    {
        "name": "Agua mineral 600ml",
        "category": "Bebidas",
        "quantity": 120.0,
        "unit": "unidad",
        "min_threshold": 48.0,
        "max_capacity": 300.0,
        "price_per_unit": 1500,
        "supplier": "Postobón S.A.",
    },
    {
        "name": "Gaseosa 2L",
        "category": "Bebidas",
        "quantity": 36.0,
        "unit": "unidad",
        "min_threshold": 12.0,
        "max_capacity": 100.0,
        "price_per_unit": 7200,
        "supplier": "Postobón S.A.",
    },
    # Condimentos
    {
        "name": "Sal marina",
        "category": "Condimentos",
        "quantity": 10.0,
        "unit": "kg",
        "min_threshold": 3.0,
        "max_capacity": 25.0,
        "price_per_unit": 900,
        "supplier": "Condimentos del Sur",
    },
    {
        "name": "Comino molido",
        "category": "Condimentos",
        "quantity": 2.0,
        "unit": "kg",
        "min_threshold": 0.5,
        "max_capacity": 5.0,
        "price_per_unit": 12000,
        "supplier": "Condimentos del Sur",
    },
]

# ─────────────────────────────────────────
# CREAR RESTAURANTES + PRODUCTOS + MOVIMIENTOS
# ─────────────────────────────────────────
movement_types = ["entrada", "salida", "ajuste"]
movement_notes = {
    "entrada": ["Compra semanal", "Pedido urgente", "Reposicion stock", "Entrega proveedor"],
    "salida":  ["Consumo cocina", "Servicio almuerzo", "Pedido especial", "Merma diaria"],
    "ajuste":  ["Inventario fisico", "Correccion conteo", "Ajuste por vencimiento"],
}

for rest in restaurants_data:
    uid = rest["uid"]
    print(f"\n{'─'*55}")
    print(f"  Creando restaurante: {rest['name']}")
    print(f"{'─'*55}")

    # 1. Documento raíz del restaurante
    rest_ref = db.collection("restaurants").document(uid)
    rest_ref.set({
        "name":        rest["name"],
        "owner_uid":   rest["owner_uid"],
        "owner_email": rest["owner_email"],
        "owner_name":  rest["owner_name"],
        "created_at":  rest["created_at"],
        "plan":        rest["plan"],
        "status":      rest["status"],
        "settings":    rest["settings"],
    })
    print(f"  [OK] Documento raiz creado: restaurants/{uid}")

    # 2. Subcolección: products
    products_ref = rest_ref.collection("products")
    product_ids = []

    for prod in products_template:
        qty_var = random.uniform(0.8, 1.2)
        prod_data = {
            **prod,
            "quantity":     round(prod["quantity"] * qty_var, 2),
            "last_updated": (now - timedelta(hours=random.randint(1, 48))).isoformat(),
            "restaurant_id": uid,
            "active": True,
        }
        _, doc_ref = products_ref.add(prod_data)
        product_ids.append((doc_ref.id, prod_data))
        print(f"     [+] Producto: {prod['name']:<25} qty={prod_data['quantity']} {prod['unit']}")

    print(f"\n  [OK] {len(product_ids)} productos creados en products/")

    # 3. Subcolección: movements (historial últimos 30 días)
    movements_ref = rest_ref.collection("movements")
    total_movements = 0

    for product_id, prod_data in product_ids:
        # Entre 5 y 15 movimientos por producto
        num_movements = random.randint(5, 15)
        for i in range(num_movements):
            days_ago    = random.randint(0, 30)
            hours_ago   = random.randint(0, 23)
            mov_type    = random.choices(
                ["entrada", "salida", "salida", "salida", "ajuste"],
                weights=[2, 5, 5, 5, 1]
            )[0]
            qty_mov = round(random.uniform(
                prod_data["min_threshold"] * 0.1,
                prod_data["min_threshold"] * 0.8
            ), 2)

            movement = {
                "product_id":    product_id,
                "product_name":  prod_data["name"],
                "movement_type": mov_type,
                "quantity":      qty_mov,
                "notes":         random.choice(movement_notes[mov_type]),
                "timestamp":     (now - timedelta(days=days_ago, hours=hours_ago)).isoformat(),
                "restaurant_id": uid,
                "user_id":       uid,
                "unit":          prod_data["unit"],
            }
            movements_ref.add(movement)
            total_movements += 1

    print(f"  [OK] {total_movements} movimientos creados en movements/")

# ─────────────────────────────────────────
# VERIFICACION FINAL
# ─────────────────────────────────────────
print(f"\n{'=' * 55}")
print("  VERIFICACION FINAL")
print(f"{'=' * 55}")

for rest in restaurants_data:
    uid = rest["uid"]
    rest_doc    = db.collection("restaurants").document(uid).get()
    products    = list(db.collection("restaurants").document(uid).collection("products").stream())
    movements   = list(db.collection("restaurants").document(uid).collection("movements").stream())

    print(f"\n  {rest['name']}")
    print(f"  Documento raiz : {'OK' if rest_doc.exists else 'ERROR'}")
    print(f"  Productos      : {len(products)}")
    print(f"  Movimientos    : {len(movements)}")

    # Verificar estructura del primer producto
    if products:
        p = products[0].to_dict()
        campos = ["name","category","quantity","unit","min_threshold",
                  "max_capacity","price_per_unit","supplier","last_updated","restaurant_id"]
        campos_ok = all(c in p for c in campos)
        print(f"  Campos producto: {'completos' if campos_ok else 'FALTAN CAMPOS'}")

print(f"\n{'=' * 55}")
print("  FIRESTORE LISTO")
print(f"  Proyecto : {settings.firebase_project_id}")
print(f"  Restau.  : {len(restaurants_data)}")
total_p = sum(len(products_template) for _ in restaurants_data)
print(f"  Productos: ~{total_p} por restaurante")
print(f"{'=' * 55}\n")
print("Siguiente paso:")
print("  1. Pegar firestore.rules en Firebase Console -> Reglas")
print("  2. Ejecutar: python main.py")
print("  3. GET http://localhost:8000/health -> firebase: connected\n")
