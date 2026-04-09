from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
import logging

from middleware.admin_auth import verify_admin_token
from supabase_service import get_supabase
from firebase_service import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


# ─── Pydantic models ──────────────────────────────────────────────────────────

class CompanyCreate(BaseModel):
    name: str
    owner_email: str
    owner_name: Optional[str] = None
    plan: str = "free"
    firebase_uid: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    owner_email: Optional[str] = None
    owner_name: Optional[str] = None
    plan: Optional[str] = None

class CompanyStatusUpdate(BaseModel):
    status: str  # 'active' | 'suspended'

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None

class ModuleToggle(BaseModel):
    enabled: bool

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    alert_threshold: Optional[int] = None
    notify_email: Optional[bool] = None
    notify_whatsapp: Optional[bool] = None
    auto_restock: Optional[bool] = None

class AdminProductCreate(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    min_threshold: float
    max_capacity: float

class AdminProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    min_threshold: Optional[float] = None
    max_capacity: Optional[float] = None


# ─── Demo data ────────────────────────────────────────────────────────────────

def _demo_companies():
    now = datetime.now().isoformat()
    return [
        {"id": "c1", "firebase_uid": "uid1", "name": "La Casa del Sabor", "owner_email": "carlos@restaurante.com", "owner_name": "Carlos García", "plan": "pro", "status": "active", "user_count": 3, "product_count": 24, "created_at": now},
        {"id": "c2", "firebase_uid": "uid2", "name": "El Rincón Colombiano", "owner_email": "maria@rincon.com", "owner_name": "María López", "plan": "free", "status": "active", "user_count": 1, "product_count": 12, "created_at": now},
        {"id": "c3", "firebase_uid": "uid3", "name": "Sabores del Mar", "owner_email": "juan@sabores.com", "owner_name": "Juan Torres", "plan": "enterprise", "status": "active", "user_count": 8, "product_count": 56, "created_at": now},
        {"id": "c4", "firebase_uid": "uid4", "name": "Pizzería Napolitana", "owner_email": "ana@pizza.com", "owner_name": "Ana Martínez", "plan": "free", "status": "suspended", "user_count": 2, "product_count": 8, "created_at": now},
    ]

def _demo_users():
    now = datetime.now().isoformat()
    return [
        {"id": "u1", "firebase_uid": "fuid1", "company_id": "c1", "company_name": "La Casa del Sabor", "email": "carlos@restaurante.com", "display_name": "Carlos García", "role": "admin", "status": "active", "last_login": now, "created_at": now},
        {"id": "u2", "firebase_uid": "fuid2", "company_id": "c1", "company_name": "La Casa del Sabor", "email": "pedro@restaurante.com", "display_name": "Pedro Sánchez", "role": "usuario", "status": "active", "last_login": now, "created_at": now},
        {"id": "u3", "firebase_uid": "fuid3", "company_id": "c2", "company_name": "El Rincón Colombiano", "email": "maria@rincon.com", "display_name": "María López", "role": "admin", "status": "active", "last_login": now, "created_at": now},
        {"id": "u4", "firebase_uid": "fuid4", "company_id": "c3", "company_name": "Sabores del Mar", "email": "juan@sabores.com", "display_name": "Juan Torres", "role": "admin", "status": "active", "last_login": now, "created_at": now},
        {"id": "u5", "firebase_uid": "fuid5", "company_id": "c4", "company_name": "Pizzería Napolitana", "email": "ana@pizza.com", "display_name": "Ana Martínez", "role": "admin", "status": "suspended", "last_login": None, "created_at": now},
    ]

def _demo_modules():
    return [
        {"module_key": "inventory", "display_name": "Inventario", "description": "Gestión de inventario y productos", "icon": "package", "enabled": True},
        {"module_key": "ai_insights", "display_name": "IA & Predicciones", "description": "Módulo de inteligencia artificial", "icon": "brain", "enabled": True},
        {"module_key": "alerts", "display_name": "Alertas", "description": "Alertas y notificaciones push", "icon": "bell", "enabled": True},
        {"module_key": "whatsapp", "display_name": "WhatsApp", "description": "Notificaciones por WhatsApp", "icon": "message-circle", "enabled": False},
        {"module_key": "reports", "display_name": "Reportes", "description": "Generación de reportes CSV/PDF", "icon": "file-text", "enabled": False},
        {"module_key": "multi_user", "display_name": "Multi-usuario", "description": "Gestión de múltiples usuarios por empresa", "icon": "users", "enabled": False},
        {"module_key": "integrations", "display_name": "Integraciones", "description": "Conexión con servicios externos", "icon": "plug", "enabled": False},
    ]


# ─── METRICS ─────────────────────────────────────────────────────────────────

@router.get("/metrics/overview")
async def get_metrics_overview(admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        return {
            "total_restaurants": 1, "total_products": 16,
            "critical_products": 2, "low_products": 3,
            "total_movements": 160, "movements_7d": 24, "new_restaurants_7d": 0,
        }
    try:
        now = datetime.now()
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        rest_res  = sb.table("restaurants").select("id, created_at").execute()
        restaurants = rest_res.data or []
        new_rests = [r for r in restaurants if (r.get("created_at") or "") >= seven_days_ago]

        prod_res  = sb.table("products").select("id, quantity, min_threshold, max_capacity").execute()
        products  = prod_res.data or []
        critical  = sum(1 for p in products if (p.get("quantity") or 0) <= (p.get("min_threshold") or 0))
        low       = sum(
            1 for p in products
            if (p.get("quantity") or 0) > (p.get("min_threshold") or 0)
            and ((p.get("quantity") or 0) / ((p.get("max_capacity") or 1) or 1) * 100) <= 30
        )

        mov_res   = sb.table("movements").select("id, created_at").execute()
        movements = mov_res.data or []
        mov_7d    = [m for m in movements if (m.get("created_at") or "") >= seven_days_ago]

        return {
            "total_restaurants":   len(restaurants),
            "total_products":      len(products),
            "critical_products":   critical,
            "low_products":        low,
            "total_movements":     len(movements),
            "movements_7d":        len(mov_7d),
            "new_restaurants_7d":  len(new_rests),
        }
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/history")
async def get_metrics_history(days: int = Query(30, ge=7, le=90), admin=Depends(verify_admin_token)):
    sb = get_supabase()
    since = (datetime.now() - timedelta(days=days)).isoformat()
    if sb is None:
        now = datetime.now()
        return [{"date": (now - timedelta(days=i)).strftime("%Y-%m-%d"), "movements": i % 8 + 1} for i in range(days, -1, -7)]
    try:
        mov_res = sb.table("movements").select("created_at").gte("created_at", since).execute()
        daily: dict = {}
        for m in (mov_res.data or []):
            day = (m.get("created_at") or "")[:10]
            if day:
                daily[day] = daily.get(day, 0) + 1
        return [{"date": k, "movements": v} for k, v in sorted(daily.items())]
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return []


@router.get("/analytics")
async def get_analytics(admin=Depends(verify_admin_token)):
    sb = get_supabase()
    thirty_ago = (datetime.now() - timedelta(days=30)).isoformat()

    if sb is None:
        return {
            "products_by_status": [
                {"status": "critical", "label": "Crítico", "count": 2, "color": "#ff453a"},
                {"status": "low",      "label": "Bajo",    "count": 3, "color": "#ff9f0a"},
                {"status": "normal",   "label": "Normal",  "count": 11, "color": "#30d158"},
            ],
            "movements_by_type": [
                {"type": "entrada", "label": "Entrada", "total": 320},
                {"type": "salida",  "label": "Salida",  "total": 480},
                {"type": "ajuste",  "label": "Ajuste",  "total": 60},
                {"type": "merma",   "label": "Merma",   "total": 20},
            ],
            "daily_movements": [],
            "per_restaurant": [{"restaurant_name": "La Casa del Sabor", "products": 16, "critical": 2}],
        }

    try:
        prod_res = sb.table("products").select("quantity, min_threshold, max_capacity, restaurant_id").execute()
        products = prod_res.data or []

        critical = sum(1 for p in products if (p.get("quantity") or 0) <= (p.get("min_threshold") or 0))
        low = sum(
            1 for p in products
            if (p.get("quantity") or 0) > (p.get("min_threshold") or 0)
            and ((p.get("quantity") or 0) / ((p.get("max_capacity") or 1) or 1) * 100) <= 30
        )
        normal = len(products) - critical - low

        mov_res = sb.table("movements").select("movement_type, quantity, created_at, restaurant_id").gte("created_at", thirty_ago).execute()
        movements = mov_res.data or []

        by_type: dict = {}
        for m in movements:
            t = m.get("movement_type", "otro")
            by_type[t] = by_type.get(t, 0) + (m.get("quantity") or 0)

        daily: dict = {}
        for m in movements:
            day = (m.get("created_at") or "")[:10]
            if day:
                daily[day] = daily.get(day, 0) + 1

        # Per-restaurant product stats
        rest_prod: dict = {}
        for p in products:
            rid = p.get("restaurant_id", "")
            if rid not in rest_prod:
                rest_prod[rid] = {"products": 0, "critical": 0}
            rest_prod[rid]["products"] += 1
            if (p.get("quantity") or 0) <= (p.get("min_threshold") or 0):
                rest_prod[rid]["critical"] += 1

        rest_res = sb.table("restaurants").select("id, name").execute()
        rest_names = {r["id"]: r["name"] for r in (rest_res.data or [])}

        TYPE_LABELS = {"entrada": "Entrada", "salida": "Salida", "ajuste": "Ajuste", "merma": "Merma"}
        TYPE_COLORS = {"entrada": "#30d158", "salida": "#ff453a", "ajuste": "#ff9f0a", "merma": "#636366"}

        return {
            "products_by_status": [
                {"status": "critical", "label": "Crítico", "count": critical, "color": "#ff453a"},
                {"status": "low",      "label": "Bajo",    "count": low,      "color": "#ff9f0a"},
                {"status": "normal",   "label": "Normal",  "count": normal,   "color": "#30d158"},
            ],
            "movements_by_type": [
                {"type": k, "label": TYPE_LABELS.get(k, k), "total": v, "color": TYPE_COLORS.get(k, "#5856d6")}
                for k, v in by_type.items()
            ],
            "daily_movements": [{"date": k, "count": v} for k, v in sorted(daily.items())],
            "per_restaurant": [
                {
                    "restaurant_id": rid,
                    "restaurant_name": rest_names.get(rid, rid[:8]),
                    "products": s["products"],
                    "critical": s["critical"],
                }
                for rid, s in rest_prod.items()
            ],
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── COMPANIES ───────────────────────────────────────────────────────────────

@router.get("/companies")
async def list_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin=Depends(verify_admin_token),
):
    sb = get_supabase()
    if sb is None:
        companies = _demo_companies()
        if status:
            companies = [c for c in companies if c["status"] == status]
        if search:
            search_lower = search.lower()
            companies = [c for c in companies if search_lower in c["name"].lower() or search_lower in c["owner_email"].lower()]
        offset = (page - 1) * limit
        return {"items": companies[offset:offset+limit], "total": len(companies), "page": page, "limit": limit}

    try:
        query = sb.table("companies").select("*")
        if status:
            query = query.eq("status", status)
        if search:
            query = query.ilike("name", f"%{search}%")
        query = query.range((page - 1) * limit, page * limit - 1)
        result = query.execute()
        count_result = sb.table("companies").select("id", count="exact").execute()
        return {
            "items": result.data or [],
            "total": count_result.count or 0,
            "page": page,
            "limit": limit,
        }
    except Exception as e:
        logger.error(f"Error listing companies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/companies", status_code=201)
async def create_company(company: CompanyCreate, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        return {"id": f"demo-{datetime.now().timestamp()}", **company.model_dump(), "status": "active", "created_at": datetime.now().isoformat()}

    try:
        data = company.model_dump()
        data["created_at"] = datetime.now().isoformat()
        data["status"] = "active"
        result = sb.table("companies").insert(data).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        logger.error(f"Error creating company: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/companies/{company_id}")
async def update_company(company_id: str, company: CompanyUpdate, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    update_data = {k: v for k, v in company.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now().isoformat()

    if sb is None:
        return {"id": company_id, **update_data}

    try:
        result = sb.table("companies").update(update_data).eq("id", company_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/companies/{company_id}/status")
async def update_company_status(company_id: str, body: CompanyStatusUpdate, admin=Depends(verify_admin_token)):
    if body.status not in ("active", "suspended", "deleted"):
        raise HTTPException(status_code=400, detail="Estado inválido")
    sb = get_supabase()
    if sb is None:
        return {"id": company_id, "status": body.status, "updated_at": datetime.now().isoformat()}
    try:
        result = sb.table("companies").update({"status": body.status, "updated_at": datetime.now().isoformat()}).eq("id", company_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/companies/{company_id}")
async def delete_company(company_id: str, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        return {"message": "Empresa eliminada (demo mode)"}
    try:
        sb.table("companies").update({"status": "deleted"}).eq("id", company_id).execute()
        return {"message": "Empresa eliminada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── USERS ───────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    admin=Depends(verify_admin_token),
):
    sb = get_supabase()
    if sb is None:
        users = _demo_users()
        if search:
            sl = search.lower()
            users = [u for u in users if sl in (u.get("display_name") or "").lower() or sl in u["email"].lower()]
        offset = (page - 1) * limit
        return {"items": users[offset:offset+limit], "total": len(users), "page": page, "limit": limit}

    try:
        # Lista usuarios desde Supabase Auth (admin API)
        response = sb.auth.admin.list_users()
        all_users = response if isinstance(response, list) else getattr(response, "users", []) or []

        result = []
        for u in all_users:
            email        = getattr(u, "email", "") or ""
            meta         = getattr(u, "user_metadata", {}) or {}
            app_meta     = getattr(u, "app_metadata", {}) or {}
            display_name = meta.get("full_name") or meta.get("name") or ""
            role         = meta.get("role") or app_meta.get("role") or "usuario"
            banned       = getattr(u, "banned_until", None)
            if search:
                sl = search.lower()
                if sl not in email.lower() and sl not in display_name.lower():
                    continue
            result.append({
                "id":           str(getattr(u, "id", "")),
                "email":        email,
                "display_name": display_name,
                "role":         role,
                "status":       "suspended" if banned else "active",
                "last_login":   str(getattr(u, "last_sign_in_at", "") or ""),
                "created_at":   str(getattr(u, "created_at", "") or ""),
            })

        offset = (page - 1) * limit
        return {"items": result[offset:offset+limit], "total": len(result), "page": page, "limit": limit}
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}")
async def update_user(user_id: str, user: UserUpdate, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    update_data = {k: v for k, v in user.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now().isoformat()

    if sb is None:
        return {"id": user_id, **update_data}

    try:
        result = sb.table("platform_users").update(update_data).eq("id", user_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        return {"message": "Usuario eliminado (demo mode)"}
    try:
        sb.table("platform_users").update({"status": "deleted"}).eq("id", user_id).execute()
        return {"message": "Usuario eliminado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── PRODUCTS (cross-tenant read from Firestore) ──────────────────────────────

@router.get("/products")
async def list_all_products(
    company_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    admin=Depends(verify_admin_token),
):
    db = get_db()
    if db is None:
        # Demo products
        products = [
            {"id": "p1", "name": "Pollo", "category": "Carnes", "quantity": 45, "unit": "kg", "min_threshold": 20, "max_capacity": 100, "company_id": "c1", "company_name": "La Casa del Sabor", "status": "normal"},
            {"id": "p2", "name": "Tomates", "category": "Verduras", "quantity": 8, "unit": "kg", "min_threshold": 10, "max_capacity": 50, "company_id": "c1", "company_name": "La Casa del Sabor", "status": "critical"},
            {"id": "p3", "name": "Aceite de Oliva", "category": "Aceites", "quantity": 3, "unit": "L", "min_threshold": 5, "max_capacity": 20, "company_id": "c2", "company_name": "El Rincón Colombiano", "status": "critical"},
            {"id": "p4", "name": "Camarones", "category": "Mariscos", "quantity": 5, "unit": "kg", "min_threshold": 8, "max_capacity": 30, "company_id": "c3", "company_name": "Sabores del Mar", "status": "low"},
            {"id": "p5", "name": "Harina", "category": "Granos", "quantity": 20, "unit": "kg", "min_threshold": 10, "max_capacity": 50, "company_id": "c4", "company_name": "Pizzería Napolitana", "status": "normal"},
        ]
        if company_id:
            products = [p for p in products if p["company_id"] == company_id]
        offset = (page - 1) * limit
        return {"items": products[offset:offset+limit], "total": len(products), "page": page, "limit": limit}

    try:
        # Get all restaurant docs
        restaurants_ref = db.collection("restaurants")
        if company_id:
            restaurant_docs = [db.collection("restaurants").document(company_id).get()]
        else:
            restaurant_docs = list(restaurants_ref.limit(50).stream())

        all_products = []
        for rest_doc in restaurant_docs:
            if not rest_doc.exists:
                continue
            rest_data = rest_doc.to_dict() or {}
            company_name = rest_data.get("name", rest_doc.id)
            products_ref = db.collection("restaurants").document(rest_doc.id).collection("products")
            for prod_doc in products_ref.stream():
                p = prod_doc.to_dict()
                p["id"] = prod_doc.id
                p["company_id"] = rest_doc.id
                p["company_name"] = company_name
                qty = p.get("quantity", 0)
                min_t = p.get("min_threshold", 0)
                max_c = p.get("max_capacity", 1)
                pct = qty / max_c * 100 if max_c > 0 else 100
                p["status"] = "critical" if qty <= min_t else ("low" if pct <= 30 else "normal")
                all_products.append(p)

        offset = (page - 1) * limit
        return {
            "items": all_products[offset:offset+limit],
            "total": len(all_products),
            "page": page,
            "limit": limit,
        }
    except Exception as e:
        logger.error(f"Error fetching admin products: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── RESTAURANTS (per-tenant view) ───────────────────────────────────────────

@router.get("/restaurants")
async def list_restaurants(admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        now = datetime.now().isoformat()
        return [
            {"id": "r1", "name": "La Casa del Sabor", "owner_id": "u1", "email": "chef@lacasadelsabor.com",
             "phone": "+57 300 000 0000", "address": "Calle Principal 123",
             "alert_threshold": 20, "notify_email": True, "notify_whatsapp": False,
             "auto_restock": False, "product_count": 16, "created_at": now},
        ]
    try:
        result = sb.table("restaurants").select("*").order("created_at", desc=True).execute()
        restaurants = result.data or []
        for r in restaurants:
            try:
                count_res = sb.table("products").select("id", count="exact").eq("restaurant_id", r["id"]).execute()
                r["product_count"] = count_res.count or 0
            except Exception:
                r["product_count"] = 0
        return restaurants
    except Exception as e:
        logger.error(f"Error listing restaurants: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/restaurants/{restaurant_id}/products")
async def get_restaurant_products(restaurant_id: str, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        return {"items": [], "total": 0}
    try:
        result = sb.table("products").select("*").eq("restaurant_id", restaurant_id).order("name").execute()
        products = result.data or []
        for p in products:
            qty = p.get("quantity", 0)
            min_t = p.get("min_threshold", 0)
            max_c = p.get("max_capacity", 1)
            pct = qty / max_c * 100 if max_c > 0 else 100
            p["status"] = "critical" if qty <= min_t else ("low" if pct <= 30 else "normal")
        return {"items": products, "total": len(products)}
    except Exception as e:
        logger.error(f"Error fetching restaurant products: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/restaurants/{restaurant_id}")
async def admin_update_restaurant(restaurant_id: str, data: RestaurantUpdate, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now().isoformat()
    if sb is None:
        return {"id": restaurant_id, **update}
    try:
        result = sb.table("restaurants").update(update).eq("id", restaurant_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        logger.error(f"Error updating restaurant: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/restaurants/{restaurant_id}/products", status_code=201)
async def admin_create_product(restaurant_id: str, data: AdminProductCreate, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    payload = {**data.model_dump(), "restaurant_id": restaurant_id, "created_at": datetime.now().isoformat()}
    if sb is None:
        return {"id": f"demo-{datetime.now().timestamp()}", **payload}
    try:
        result = sb.table("products").insert(payload).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/restaurants/{restaurant_id}/products/{product_id}")
async def admin_update_product(restaurant_id: str, product_id: str, data: AdminProductUpdate, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now().isoformat()
    if sb is None:
        return {"id": product_id, **update}
    try:
        result = sb.table("products").update(update).eq("id", product_id).eq("restaurant_id", restaurant_id).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/restaurants/{restaurant_id}/products/{product_id}")
async def admin_delete_product(restaurant_id: str, product_id: str, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        return {"message": "Producto eliminado (demo)"}
    try:
        sb.table("movements").delete().eq("product_id", product_id).execute()
        sb.table("products").delete().eq("id", product_id).eq("restaurant_id", restaurant_id).execute()
        return {"message": "Producto eliminado"}
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/restaurants/{restaurant_id}/movements")
async def get_restaurant_movements(
    restaurant_id: str,
    limit: int = Query(100, ge=1, le=500),
    admin=Depends(verify_admin_token),
):
    sb = get_supabase()
    if sb is None:
        return {"items": [], "total": 0}
    try:
        result = (
            sb.table("movements")
            .select("id, product_id, product_name, movement_type, quantity, unit, notes, created_at")
            .eq("restaurant_id", restaurant_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        movements = []
        for m in (result.data or []):
            movements.append({
                "id":           m.get("id"),
                "product_id":   m.get("product_id"),
                "product_name": m.get("product_name", "—"),
                "product_unit": m.get("unit", ""),
                "type":         m.get("movement_type"),
                "quantity":     m.get("quantity"),
                "notes":        m.get("notes"),
                "created_at":   m.get("created_at"),
            })
        return {"items": movements, "total": len(movements)}
    except Exception as e:
        logger.error(f"Error fetching restaurant movements: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── MODULES ─────────────────────────────────────────────────────────────────

@router.get("/modules")
async def list_modules(company_id: Optional[str] = None, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    if sb is None:
        modules = _demo_modules()
        if company_id:
            # Simulate per-company state
            company_idx = {"c1": [True, True, True, False, True, False, False],
                          "c2": [True, False, True, False, False, False, False],
                          "c3": [True, True, True, True, True, True, True]}.get(company_id, [True, True, True, False, False, False, False])
            for i, m in enumerate(modules):
                m["enabled"] = company_idx[i] if i < len(company_idx) else False
        return modules

    try:
        if company_id:
            result = sb.table("company_modules").select("*").eq("company_id", company_id).execute()
        else:
            result = sb.table("company_modules").select("*").execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/modules/{company_id}/{module_key}")
async def toggle_module(company_id: str, module_key: str, body: ModuleToggle, admin=Depends(verify_admin_token)):
    sb = get_supabase()
    now = datetime.now().isoformat()

    if sb is None:
        return {"company_id": company_id, "module_key": module_key, "enabled": body.enabled, "updated_at": now}

    try:
        result = sb.table("company_modules").upsert({
            "company_id": company_id,
            "module_key": module_key,
            "enabled": body.enabled,
            "updated_at": now,
        }).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
