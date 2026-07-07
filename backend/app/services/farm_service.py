import uuid
import logging
from datetime import datetime, UTC
from typing import Any, Dict, List, Optional
from app.repositories import FarmRepository
from app.utils.geo import validate_geojson_polygon, compute_farm_geometry, reverse_geocode

logger = logging.getLogger(__name__)

class FarmService:
    """Service class encapsulating business logic and repository calls for Farms."""

    @classmethod
    async def create(cls, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new farm boundary, auto-computing geometry and address details if needed."""
        boundary = data.get("boundary")
        if boundary:
            is_valid, err = validate_geojson_polygon(boundary)
            if not is_valid:
                raise ValueError(f"Invalid boundary polygon: {err}")
            
            # Compute center and areas
            geom = compute_farm_geometry(boundary)
            data.update(geom)
            
            # Reverse geocode if location fields are not provided
            center = geom.get("center_coordinate")
            if center and not all([data.get("village"), data.get("district"), data.get("state"), data.get("country")]):
                address = await reverse_geocode(center["latitude"], center["longitude"])
                for k, v in address.items():
                    if not data.get(k):
                        data[k] = v

        # Check if user already has farms. If not, make this one active.
        existing_farms = await FarmRepository.list_for_user(user_id)
        is_active = len(existing_farms) == 0

        farm_data = {
            "farm_id": str(uuid.uuid4()),
            "user_id": user_id,
            "name": data["name"],
            "boundary": boundary,
            "center_coordinate": data.get("center_coordinate"),
            "area_m2": data.get("area_m2"),
            "area_acres": data.get("area_acres"),
            "area_hectares": data.get("area_hectares"),
            "village": data.get("village") or "",
            "district": data.get("district") or "",
            "state": data.get("state") or "",
            "country": data.get("country") or "",
            "is_active": is_active,
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
        }
        return await FarmRepository.create(farm_data)

    @classmethod
    async def list_for_user(cls, user_id: str) -> List[Dict[str, Any]]:
        """List all farms owned by the user."""
        return await FarmRepository.list_for_user(user_id)

    @classmethod
    async def get_by_id(cls, farm_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific farm by its UUID."""
        return await FarmRepository.get(farm_id, user_id)

    @classmethod
    async def get_active(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the currently active farm for the user."""
        return await FarmRepository.get_active(user_id)

    @classmethod
    async def update(cls, farm_id: str, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update farm details and re-calculate boundary properties if they changed."""
        boundary = updates.get("boundary")
        if boundary:
            is_valid, err = validate_geojson_polygon(boundary)
            if not is_valid:
                raise ValueError(f"Invalid boundary polygon: {err}")
            
            # Recompute center and areas
            geom = compute_farm_geometry(boundary)
            updates.update(geom)
            
            # Reverse geocode if location fields are not provided
            center = geom.get("center_coordinate")
            if center and not all([updates.get("village"), updates.get("district"), updates.get("state"), updates.get("country")]):
                address = await reverse_geocode(center["latitude"], center["longitude"])
                for k, v in address.items():
                    if not updates.get(k):
                        updates[k] = v

        updates["updated_at"] = datetime.now(UTC)
        return await FarmRepository.update(farm_id, user_id, updates)

    @classmethod
    async def delete(cls, farm_id: str, user_id: str) -> bool:
        """Delete a farm."""
        return await FarmRepository.delete(farm_id, user_id)

    @classmethod
    async def activate(cls, farm_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Mark a farm as active for the user."""
        return await FarmRepository.set_active(user_id, farm_id)
