"""
KrishiMitra Backend – Pydantic Models (MongoDB Documents)
==========================================================
Internal document models used between service and database layers.
These are NOT exposed directly to the API consumer.
"""
from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserModel(BaseModel):
    """Represents a user document stored in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    phone: str
    hashed_password: str
    language: str = "en"
    location: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class ChatHistoryModel(BaseModel):
    """Represents a single chat exchange in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    session_id: str
    user_message: str
    assistant_reply: str
    intent: str
    language: str
    context_data: Optional[dict[str, Any]] = None
    latency_ms: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class CropPredictionModel(BaseModel):
    """Represents a crop prediction result in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    input_features: dict[str, Any]
    recommended_crop: str
    confidence: float
    alternatives: List[str]
    explanation: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class VehiclePredictionModel(BaseModel):
    """Represents a vehicle demand prediction in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    location: str
    crop_type: str
    quantity_tonnes: float
    destination: str
    demand_level: str
    recommended_vehicles: List[str]
    estimated_cost_inr: dict[str, float]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class RouteModel(BaseModel):
    """Represents a planned route in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    origin: str
    destination: str
    total_distance_km: float
    total_duration_min: float
    route_data: dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class CourierRequestModel(BaseModel):
    """Represents a community courier request in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    pickup_location: str
    delivery_location: str
    cargo_description: str
    weight_kg: float
    preferred_date: str
    contact_phone: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class SOSAlertModel(BaseModel):
    """Represents an emergency SOS alert in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = None
    latitude: float
    longitude: float
    description: str
    emergency_type: str
    contact_phone: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class WeatherCacheModel(BaseModel):
    """Cached weather API response."""
    id: Optional[str] = Field(default=None, alias="_id")
    cache_key: str
    data: dict[str, Any]
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


class SatelliteDataModel(BaseModel):
    """Satellite / GEE processed data for a location."""
    id: Optional[str] = Field(default=None, alias="_id")
    location: str
    latitude: float
    longitude: float
    ndvi: Optional[float] = None
    crop_health: Optional[str] = None
    vegetation_index: Optional[float] = None
    harvest_detection: Optional[str] = None
    raw_data: Optional[dict[str, Any]] = None
    processed_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
