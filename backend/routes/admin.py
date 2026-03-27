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
        companies = _demo_companies()
        users = _demo_users()
        now = datetime.now()
        return {
            "total_companies": len(companies),
            "total_users": len(users),
            "active_companies": len([c for c in companies if c["status"] == "active"]),
            "suspended_companies": len([c for c in companies if c["status"] == "suspended"]),
            "new_companies_7d": 2,
            "new_users_7d": 3,
            "total_products": 100,
            "critical_products": 8,
            "top_plans": [
                {"plan": "free", "count": 2},
                {"plan": "pro", "count": 1},
                {"plan": "enterprise", "count": 1},
            ],
        }
    try:
        companies_res = sb.table("companies").select("id, status, created_at").execute()
        companies = companies_res.data or []
        users_res = sb.table("platform_users").select("id, created_at").execute()
        users = users_res.data or []
        now = datetime.now()
        seven_days_ago = (now - timedelta(days=7)).isoformat()

        new_companies = [c for c in companies if c.get("created_at", "") > seven_days_ago]
        new_users = [u for u in users if u.get("created_at", "") > seven_days_ago]

        plans_res = sb.table("companies").select("plan").execute()
        plan_counts: dict = {}
        for c in (plans_res.data or []):
            p = c.get("plan", "free")
            plan_counts[p] = plan_counts.get(p, 0) + 1
        top_plans = [{"plan": k, "count": v} for k, v in plan_counts.items()]

        return {
            "total_companies": len(companies),
            "total_users": len(users),
            "active_companies": len([c for c in companies if c.get("status") == "active"]),
            "suspended_companies": len([c for c in companies if c.get("status") == "suspended"]),
            "new_companies_7d": len(new_companies),
            "new_users_7d": len(new_users),
            "total_products": 0,
            "critical_products": 0,
            "top_plans": top_plans,
        }
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/history")
async def get_metrics_history(days: int = Query(30, ge=7, le=90), admin=Depends(verify_admin_token)):
    # Return simulated history data
    now = datetime.now()
    history = []
    total_c, total_u = 4, 5
    for i in range(days, -1, -1):
        d = now - timedelta(days=i)
        # Simulate growth
        history.append({
            "date": d.strftime("%Y-%m-%d"),
            "total_companies": max(1, total_c - i // 5),
            "total_users": max(1, total_u - i // 4),
            "active_companies": max(1, total_c - i // 5 - (1 if i > 10 else 0)),
        })
    return history


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
    limit: int = Query(20, ge=1, le=100),
    company_id: Optional[str] = None,
    search: Optional[str] = None,
    admin=Depends(verify_admin_token),
):
    sb = get_supabase()
    if sb is None:
        users = _demo_users()
        if company_id:
            users = [u for u in users if u["company_id"] == company_id]
        if search:
            search_lower = search.lower()
            users = [u for u in users if search_lower in (u.get("display_name") or "").lower() or search_lower in u["email"].lower()]
        offset = (page - 1) * limit
        return {"items": users[offset:offset+limit], "total": len(users), "page": page, "limit": limit}

    try:
        query = sb.table("platform_users").select("*, companies(name)")
        if company_id:
            query = query.eq("company_id", company_id)
        if search:
            query = query.ilike("email", f"%{search}%")
        query = query.range((page - 1) * limit, page * limit - 1)
        result = query.execute()
        count_res = sb.table("platform_users").select("id", count="exact").execute()
        items = []
        for u in (result.data or []):
            u["company_name"] = (u.get("companies") or {}).get("name")
            items.append(u)
        return {"items": items, "total": count_res.count or 0, "page": page, "limit": limit}
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
