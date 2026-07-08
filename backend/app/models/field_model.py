from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class FieldModel(BaseModel):
    """Represents a customized agricultural field saved in MongoDB."""
    id: Optional[str] = Field(default=None, alias="_id")
    fieldName: str
    ownerId: str
    areaHectare: float
    areaSqMeter: float
    areaAcres: float
    polygon: Dict[str, Any]  # GeoJSON Polygon: {"type": "Polygon", "coordinates": [[[lon, lat], ...]]}
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
