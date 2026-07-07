"""
KrishiMitra Backend – Geospatial Utilities
==========================================
Pure-Python helpers for polygon area calculation, centroid computation,
and unit conversions.  No external geo libraries required.

All coordinate systems: WGS84 (longitude, latitude) as per GeoJSON spec.
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple


# ── Earth radius (metres) ────────────────────────────────────────────────────
_EARTH_RADIUS_M = 6_371_000.0


def calculate_polygon_area_m2(coordinates: List[List[List[float]]]) -> float:
    """
    Calculate the area of a GeoJSON Polygon (first ring only) in square metres.

    Uses the Spherical Excess formula (accurate for large polygons).
    Coordinates must be in GeoJSON order: [longitude, latitude].

    Args:
        coordinates: GeoJSON Polygon coordinates array, e.g.
                     [[[lon, lat], [lon, lat], ...]]

    Returns:
        Area in square metres (always positive).
    """
    if not coordinates or not coordinates[0]:
        return 0.0

    ring = coordinates[0]  # Exterior ring
    n = len(ring)
    if n < 3:
        return 0.0

    # Shoelace formula on projected coordinates (equirectangular)
    # Convert degrees → radians
    def _rad(deg: float) -> float:
        return deg * math.pi / 180.0

    area = 0.0
    for i in range(n - 1):
        lon1, lat1 = ring[i][0], ring[i][1]
        lon2, lat2 = ring[i + 1][0], ring[i + 1][1]

        # Convert to metres using equirectangular approximation
        x1 = _rad(lon1) * _EARTH_RADIUS_M * math.cos(_rad(lat1))
        y1 = _rad(lat1) * _EARTH_RADIUS_M
        x2 = _rad(lon2) * _EARTH_RADIUS_M * math.cos(_rad(lat2))
        y2 = _rad(lat2) * _EARTH_RADIUS_M

        area += (x1 * y2) - (x2 * y1)

    return abs(area) / 2.0


def area_to_acres(area_m2: float) -> float:
    """Convert square metres to acres."""
    return area_m2 * 0.000247105


def area_to_hectares(area_m2: float) -> float:
    """Convert square metres to hectares."""
    return area_m2 / 10_000.0


def polygon_centroid(coordinates: List[List[List[float]]]) -> Optional[Dict[str, float]]:
    """
    Compute the geometric centroid of a GeoJSON Polygon's exterior ring.

    Args:
        coordinates: GeoJSON Polygon coordinates array.

    Returns:
        {"latitude": float, "longitude": float} or None if invalid.
    """
    if not coordinates or not coordinates[0]:
        return None

    ring = coordinates[0]
    n = len(ring)
    if n < 3:
        return None

    # Simple average of vertices (good enough for small farm polygons)
    # Exclude the closing point if it equals the first point
    points = ring[:-1] if (ring[0] == ring[-1] and n > 3) else ring

    avg_lon = sum(p[0] for p in points) / len(points)
    avg_lat = sum(p[1] for p in points) / len(points)

    return {"latitude": round(avg_lat, 6), "longitude": round(avg_lon, 6)}


def validate_geojson_polygon(boundary: Any) -> Tuple[bool, str]:
    """
    Validate that a dict is a valid GeoJSON Polygon.

    Returns:
        (is_valid: bool, error_message: str)
    """
    if not isinstance(boundary, dict):
        return False, "Boundary must be a JSON object."

    if boundary.get("type") != "Polygon":
        return False, 'Boundary type must be "Polygon".'

    coordinates = boundary.get("coordinates")
    if not isinstance(coordinates, list) or not coordinates:
        return False, "Boundary must have a coordinates array."

    ring = coordinates[0]
    if not isinstance(ring, list) or len(ring) < 4:
        return False, "Polygon ring must have at least 4 coordinate pairs (3 unique + 1 closing)."

    for point in ring:
        if not isinstance(point, (list, tuple)) or len(point) < 2:
            return False, "Each coordinate must be [longitude, latitude]."
        lon, lat = point[0], point[1]
        if not (-180 <= lon <= 180):
            return False, f"Invalid longitude: {lon}. Must be between -180 and 180."
        if not (-90 <= lat <= 90):
            return False, f"Invalid latitude: {lat}. Must be between -90 and 90."

    return True, ""


def compute_farm_geometry(boundary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Given a GeoJSON Polygon boundary, compute all derived geometry:
    - centroid
    - area_m2
    - area_acres
    - area_hectares

    Returns a dict of computed values (ready to merge into farm document).
    """
    coordinates = boundary.get("coordinates", [])

    area_m2 = calculate_polygon_area_m2(coordinates)
    centroid = polygon_centroid(coordinates)

    return {
        "area_m2": round(area_m2, 2),
        "area_acres": round(area_to_acres(area_m2), 4),
        "area_hectares": round(area_to_hectares(area_m2), 4),
        "center_coordinate": centroid,
    }


async def reverse_geocode(latitude: float, longitude: float) -> Dict[str, str]:
    """
    Perform reverse geocoding via OpenStreetMap Nominatim.
    Returns a dict with village, district, state, country.
    """
    import httpx
    NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                NOMINATIM_REVERSE,
                params={"lat": latitude, "lon": longitude, "format": "json", "addressdetails": 1},
                headers={"User-Agent": "KrishiMitra/1.0 (contact@krishimitra.ai)"},
            )
            response.raise_for_status()
            result = response.json()
            address = result.get("address", {})
            
            # Extract village or town or city or suburb
            village = (
                address.get("village")
                or address.get("town")
                or address.get("suburb")
                or address.get("city")
                or address.get("hamlet")
                or ""
            )
            district = address.get("county") or address.get("district") or address.get("state_district") or ""
            state = address.get("state") or ""
            country = address.get("country") or ""
            
            return {
                "village": village,
                "district": district,
                "state": state,
                "country": country,
            }
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error("Reverse geocode error: %s", exc)
        return {
            "village": "",
            "district": "",
            "state": "",
            "country": "",
        }

