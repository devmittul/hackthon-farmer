"""
KrishiMitra Backend – Digital Twin Document Models
====================================================
Pydantic models representing the core Digital Twin objects:
  - FarmerProfile  → one per registered user
  - FarmProfile    → one per farm (a farmer may own many)
  - FieldProfile   → one per field inside a farm

These are MongoDB document models used across the repository layer.
They are NEVER directly exposed to the API consumer; only DTOs are.

Architecture note:
  The Digital Twin is the single source of truth for all contextual
  data passed to the AI Reasoning Engine.  Gemini NEVER reads the DB
  directly; instead the Context Builder assembles a structured snapshot
  from these documents and passes it as structured facts.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── Geolocation ───────────────────────────────────────────────────────────────
class GeoPoint(BaseModel):
    """GeoJSON Point for a GPS coordinate."""
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None


class GeoPolygon(BaseModel):
    """Simplified GeoJSON Polygon (list of lat/lon rings)."""
    coordinates: List[List[List[float]]]  # [[ [lon, lat], ... ]]
    area_ha: Optional[float] = None


# ── Field / Crop History entries ──────────────────────────────────────────────
class HarvestRecord(BaseModel):
    """Historical harvest entry for yield tracking."""
    season: str                          # e.g. "Kharif 2024"
    crop: str
    variety: Optional[str] = None
    yield_kg_per_ha: Optional[float] = None
    total_yield_kg: Optional[float] = None
    harvest_date: Optional[str] = None  # YYYY-MM-DD
    notes: Optional[str] = None


class DiseaseRecord(BaseModel):
    """Recorded disease or pest event."""
    date: str                            # YYYY-MM-DD
    disease_name: str
    severity: str                        # low / medium / high / critical
    treatment_applied: Optional[str] = None
    loss_estimate_pct: Optional[float] = None


class IrrigationRecord(BaseModel):
    """Single irrigation event."""
    date: str                            # YYYY-MM-DD
    method: str                          # drip / flood / sprinkler / rainfed
    duration_hours: Optional[float] = None
    water_volume_litres: Optional[float] = None


class MarketSaleRecord(BaseModel):
    """Record of a market / mandi sale."""
    date: str
    mandi_name: Optional[str] = None
    crop: str
    quantity_kg: float
    price_per_kg: float
    total_revenue_inr: float
    buyer: Optional[str] = None


class SatelliteSnapshot(BaseModel):
    """Persisted satellite reading for a field."""
    captured_at: str                     # YYYY-MM-DD
    ndvi: Optional[float] = None
    ndwi: Optional[float] = None
    crop_health: Optional[str] = None
    vegetation_index: Optional[float] = None
    harvest_stage: Optional[str] = None
    data_source: str = "Sentinel-2 SR (GEE)"


# ── SoilGrids Digital Twin ───────────────────────────────────────────────────
class DerivedSoilIntelligence(BaseModel):
    """Scientifically supported rules-based soil intelligence."""
    water_holding_capacity: str  
    drainage_behaviour: str      
    nutrient_retention: str
    root_penetration: str
    irrigation_suitability: str
    drought_sensitivity: str
    soil_fertility: str
    compaction_risk: Optional[str] = None
    organic_matter_status: Optional[str] = None
    soil_health_summary: Optional[str] = None
    reason: str
    confidence: float
    source: str = "Google Earth Engine"


class SoilProfile(BaseModel):
    """Normalized soil properties from SoilGrids or equivalent provider."""
    bulk_density_cg_cm3: Optional[float] = None     # bdod
    cation_exchange_capacity_mmol_kg: Optional[float] = None # cec
    coarse_fragments_vol_pct: Optional[float] = None # cfvo
    clay_pct: Optional[float] = None                # clay
    nitrogen_cg_kg: Optional[float] = None          # nitrogen
    ph_h2o: Optional[float] = None                  # phh2o
    sand_pct: Optional[float] = None                # sand
    silt_pct: Optional[float] = None                # silt
    soc_dg_kg: Optional[float] = None               # soc
    texture_class: Optional[str] = None             # USDA texture class
    
    # Store derived intelligence
    derived_intelligence: Optional[DerivedSoilIntelligence] = None
    raw_response: Optional[Dict[str, Any]] = None
    uncertainty: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None
    provider_source: str = "ISRIC SoilGrids"


# ── Field Digital Twin ─────────────────────────────────────────────────────────
class FieldProfile(BaseModel):
    """
    Digital Twin for a single agricultural field.

    This document captures everything known about one field:
    geometry, soil, current crop, history, and satellite data.
    The Context Builder reads this to assemble field-specific context
    before any AI call.
    """
    field_id: str                                        # UUID
    farm_id: str                                         # parent farm
    user_id: str                                         # owner

    # Identity
    name: Optional[str] = None                           # "North Field", "Block A"
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

    # Geometry
    centroid: Optional[GeoPoint] = None
    boundary: Optional[GeoPolygon] = None
    area_ha: Optional[float] = None

    # Soil
    soil_type: Optional[str] = None                      # clay / loam / sandy …
    soil_ph: Optional[float] = None
    nitrogen_kg_ha: Optional[float] = None
    phosphorus_kg_ha: Optional[float] = None
    potassium_kg_ha: Optional[float] = None
    organic_matter_pct: Optional[float] = None
    soil_tested_on: Optional[str] = None                 # YYYY-MM-DD

    # Irrigation
    irrigation_type: Optional[str] = None               # drip / flood / rainfed
    water_source: Optional[str] = None                  # canal / borewell / rain
    irrigation_history: List[IrrigationRecord] = Field(default_factory=list)

    # Current season
    current_crop: Optional[str] = None
    current_variety: Optional[str] = None
    sowing_date: Optional[str] = None                   # YYYY-MM-DD
    expected_harvest_date: Optional[str] = None         # YYYY-MM-DD
    growth_stage: Optional[str] = None                  # seedling / vegetative / flowering …

    # History
    harvest_history: List[HarvestRecord] = Field(default_factory=list)
    disease_history: List[DiseaseRecord] = Field(default_factory=list)
    market_history: List[MarketSaleRecord] = Field(default_factory=list)
    satellite_history: List[SatelliteSnapshot] = Field(default_factory=list)

    # Latest satellite snapshot (denormalised for fast reads)
    latest_satellite: Optional[SatelliteSnapshot] = None

    # SoilGrids detailed profile
    soil_profile: Optional[SoilProfile] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


# ── Farm Digital Twin ──────────────────────────────────────────────────────────
class FarmProfile(BaseModel):
    """
    Digital Twin for a farm (collection of fields owned by a farmer).

    A farmer may own multiple farms.  Each farm groups related fields
    and stores farm-level metadata like government scheme registrations.
    """
    farm_id: str                                         # UUID
    user_id: str                                         # owner

    name: Optional[str] = None                          # "Patel Farm", "Block B"
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    total_area_ha: Optional[float] = None

    field_ids: List[str] = Field(default_factory=list)  # child field IDs
    primary_crops: List[str] = Field(default_factory=list)

    # Government / scheme data
    farmer_id_pmkisan: Optional[str] = None
    registered_schemes: List[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


# ── Farmer Digital Twin ────────────────────────────────────────────────────────
class FarmerProfile(BaseModel):
    """
    Digital Twin for a farmer.

    This is the top-level profile anchored to a user account.
    It stores identity, language, location, preferences, and lists of
    farms / fields so the Context Builder can load the complete picture
    in one pass.
    """
    user_id: str                                          # matches users._id

    # Identity
    name: str
    phone: Optional[str] = None
    preferred_language: str = "en"

    # Location
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    gps_home: Optional[GeoPoint] = None

    # Preferences
    preferred_units: str = "metric"                       # metric / imperial
    notification_prefs: Dict[str, Any] = Field(default_factory=dict)

    # Linked resources
    farm_ids: List[str] = Field(default_factory=list)
    field_ids: List[str] = Field(default_factory=list)

    # Aggregated history (lightweight summary)
    total_fields: int = 0
    total_area_ha: Optional[float] = None
    primary_crops: List[str] = Field(default_factory=list)

    # Prediction history (last 10 predictions stored inline for speed)
    recent_crop_predictions: List[Dict[str, Any]] = Field(default_factory=list)
    recent_vehicle_predictions: List[Dict[str, Any]] = Field(default_factory=list)

    # Conversation memory (last session IDs for context)
    last_session_ids: List[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
