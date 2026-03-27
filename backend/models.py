from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    min_threshold: float
    max_capacity: float
    price_per_unit: float
    supplier: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    min_threshold: Optional[float] = None
    max_capacity: Optional[float] = None
    price_per_unit: Optional[float] = None
    supplier: Optional[str] = None

class Product(ProductBase):
    id: str
    last_updated: str
    restaurant_id: str

    class Config:
        from_attributes = True

class StockMovement(BaseModel):
    product_id: str
    movement_type: Literal["entrada", "salida", "ajuste"]
    quantity: float
    notes: Optional[str] = None
    timestamp: Optional[str] = None

class RestaurantSettings(BaseModel):
    name: str
    address: str
    phone: str
    email: str
    alert_threshold: int = Field(default=20, ge=10, le=50)
    notify_whatsapp: bool = False
    notify_email: bool = True
    auto_restock: bool = False

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    restaurant_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class AIAlert(BaseModel):
    id: str
    type: Literal["warning", "critical", "info", "success"]
    title: str
    message: str
    product: str
    timestamp: str

class AIPrediction(BaseModel):
    product: str
    product_id: str
    current_stock: float
    daily_consumption: float
    days_remaining: float
    restock_recommendation: float
    confidence: float
    unit: str
