/**
 * KrishiMitra – Farm Type Definitions
 * All types for the geo-aware farm management system.
 */

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lon, lat], [lon, lat], ...]]
}

export interface CenterCoordinate {
  latitude: number;
  longitude: number;
}

export interface Farm {
  farm_id: string;
  user_id: string;
  name: string;
  boundary?: GeoJsonPolygon;
  center_coordinate?: CenterCoordinate;
  area_m2?: number;
  area_acres?: number;
  area_hectares?: number;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
  latest_satellite?: {
    captured_at?: string;
    ndvi?: number;
    ndvi_min?: number;
    ndvi_max?: number;
    ndwi?: number;
    ndwi_min?: number;
    ndwi_max?: number;
    evi?: number;
    evi_min?: number;
    evi_max?: number;
    crop_health?: string;
    vegetation_health?: string;
    vegetation_index?: number;
    harvest_stage?: string;
    data_source?: string;
  };
  satellite_history?: Array<{
    captured_at: string;
    ndvi: number;
    crop_health: string;
    vegetation_index: number;
    harvest_stage: string;
  }>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  _id?: string;
}

export interface CreateFarmPayload {
  name: string;
  boundary?: GeoJsonPolygon;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
}

export interface UpdateFarmPayload {
  name?: string;
  boundary?: GeoJsonPolygon;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
}

export interface FarmStats {
  totalFarms: number;
  totalAcres: number;
  activeFarm: Farm | null;
}
