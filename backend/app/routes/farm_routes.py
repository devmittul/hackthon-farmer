from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from app.auth.dependencies import CurrentUser
from app.services.farm_service import FarmService
from app.schemas.responses import success_response

router = APIRouter(prefix="/farms", tags=["Farm Management"])

class FarmCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the farm")
    boundary: Optional[Dict[str, Any]] = Field(None, description="GeoJSON Polygon boundary")
    village: Optional[str] = Field(None, description="Village name")
    district: Optional[str] = Field(None, description="District name")
    state: Optional[str] = Field(None, description="State name")
    country: Optional[str] = Field(None, description="Country name")

class FarmUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    boundary: Optional[Dict[str, Any]] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

@router.post("", summary="Create a new farm")
async def create_farm(payload: FarmCreateRequest, current_user: CurrentUser) -> dict:
    """Create a new farm for the authenticated user."""
    user_id = current_user["_id"]
    try:
        farm = await FarmService.create(user_id, payload.model_dump())
        return success_response(
            data=farm,
            message=f"Farm '{payload.name}' created successfully."
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )

@router.get("", summary="List all farms")
async def list_farms(current_user: CurrentUser) -> dict:
    """List all farms owned by the authenticated user."""
    user_id = current_user["_id"]
    farms = await FarmService.list_for_user(user_id)
    return success_response(
        data=farms,
        message=f"{len(farms)} farm(s) found.",
        metadata={"total": len(farms)}
    )

@router.get("/active", summary="Get the active farm")
async def get_active_farm(current_user: CurrentUser) -> dict:
    """Retrieve the user's currently active farm."""
    user_id = current_user["_id"]
    farm = await FarmService.get_active(user_id)
    return success_response(
        data=farm,
        message="Active farm details loaded."
    )

@router.get("/{farm_id}", summary="Get farm details")
async def get_farm(farm_id: str, current_user: CurrentUser) -> dict:
    """Retrieve details of a specific farm by ID."""
    user_id = current_user["_id"]
    farm = await FarmService.get_by_id(farm_id, user_id)
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm '{farm_id}' not found."
        )
    return success_response(
        data=farm,
        message="Farm details loaded."
    )

@router.patch("/{farm_id}", summary="Update a farm")
async def update_farm(farm_id: str, payload: FarmUpdateRequest, current_user: CurrentUser) -> dict:
    """Update details of an existing farm."""
    user_id = current_user["_id"]
    try:
        farm = await FarmService.update(farm_id, user_id, payload.model_dump(exclude_none=True))
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farm '{farm_id}' not found."
            )
        return success_response(
            data=farm,
            message="Farm updated successfully."
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )

@router.delete("/{farm_id}", summary="Delete a farm")
async def delete_farm(farm_id: str, current_user: CurrentUser) -> dict:
    """Delete a farm permanently."""
    user_id = current_user["_id"]
    deleted = await FarmService.delete(farm_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm '{farm_id}' not found or could not be deleted."
        )
    return success_response(
        data={"farm_id": farm_id, "deleted": deleted},
        message="Farm deleted successfully."
    )

@router.post("/{farm_id}/activate", summary="Activate a farm")
async def activate_farm(farm_id: str, current_user: CurrentUser) -> dict:
    """Set a specific farm as the active farm for the user."""
    user_id = current_user["_id"]
    farm = await FarmService.activate(farm_id, user_id)
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm '{farm_id}' not found."
        )
    return success_response(
        data=farm,
        message=f"Farm '{farm.get('name')}' is now active."
    )


@router.post("/{farm_id}/analyze", summary="Analyze farm using satellite data")
@router.get("/{farm_id}/satellite", summary="Get latest satellite data for farm")
async def analyze_farm_satellite(farm_id: str, current_user: CurrentUser) -> dict:
    """
    Return the latest satellite snapshot (NDVI, NDWI, EVI, Vegetation Health, Area Statistics) for this farm.
    Triggers a fresh GEE fetch if the farm has a boundary or center coordinate.
    """
    user_id = current_user["_id"]
    farm = await FarmService.get_by_id(farm_id, user_id)
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm '{farm_id}' not found.",
        )

    center = farm.get("center_coordinate")
    if not center or not center.get("latitude"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farm does not have a valid GPS center coordinate. Update coordinates to run satellite analysis."
        )

    try:
        from app.ai.satellite.service import get_ndvi
        sat = await get_ndvi(
            latitude=center["latitude"],
            longitude=center["longitude"],
            location_name=farm.get("name") or farm_id,
            boundary=farm.get("boundary")
        )

        if sat and sat.get("ndvi") is not None:
            # Persist snapshot back to farm
            snapshot = {
                "captured_at": sat.get("analysis_date"),
                "ndvi": sat.get("ndvi"),
                "ndvi_min": sat.get("ndvi_min"),
                "ndvi_max": sat.get("ndvi_max"),
                "ndwi": sat.get("ndwi"),
                "ndwi_min": sat.get("ndwi_min"),
                "ndwi_max": sat.get("ndwi_max"),
                "evi": sat.get("evi"),
                "evi_min": sat.get("evi_min"),
                "evi_max": sat.get("evi_max"),
                "crop_health": sat.get("crop_health"),
                "vegetation_health": sat.get("vegetation_health"),
                "vegetation_index": sat.get("vegetation_index"),
                "harvest_stage": sat.get("harvest_detection"),
                "area_statistics": sat.get("area_statistics"),
                "data_source": sat.get("data_source"),
            }

            from app.database import get_collection
            from datetime import datetime, UTC
            col = get_collection("farms")
            await col.update_one(
                {"farm_id": farm_id, "user_id": user_id},
                {
                    "$set": {
                        "latest_satellite": snapshot,
                        "updated_at": datetime.now(UTC)
                    },
                    "$push": {
                        "satellite_history": {
                            "$each": [snapshot],
                            "$slice": -24
                        }
                    }
                }
            )

        return success_response(
            data=sat,
            message="Satellite data refreshed successfully."
        )
    except Exception as exc:
        import logging
        logger = logging.getLogger(__name__)
        logger.error("Satellite fetch failed for farm=%s: %s", farm_id, exc)
        return success_response(
            data=farm.get("latest_satellite"),
            message="Using cached satellite data due to error."
        )
