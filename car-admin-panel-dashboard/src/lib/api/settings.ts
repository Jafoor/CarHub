import { apiClient } from "./axios";

// --- Types ---

export interface Region {
  id: number;
  name: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

export interface City {
  id: number;
  name: string;
  display_name: string;
  region_id: number;
  region?: Region;
  is_active: boolean;
  created_at: string;
}

export interface Area {
  id: number;
  name: string;
  display_name: string;
  city_id: number;
  city?: City;
  is_active: boolean;
  created_at: string;
}

export interface SettingsListParams {
  page?: number;
  limit?: number;
  search?: string;
  region_id?: number;
  city_id?: number;
}

export interface SettingsListResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// --- API ---

export const settingsApi = {
  // Regions
  getRegions: async (params?: SettingsListParams) => {
    const { data } = await apiClient.get<SettingsListResponse<Region>>(
      "/settings/regions",
      { params }
    );
    return data;
  },
  createRegion: async (payload: { name: string; display_name: string; is_active: boolean }) => {
    const { data } = await apiClient.post<SingleResponse<Region>>(
      "/settings/regions",
      payload
    );
    return data;
  },
  updateRegion: async (
    id: number,
    payload: { name?: string; display_name?: string; is_active?: boolean }
  ) => {
    const { data } = await apiClient.put<SingleResponse<Region>>(
      `/settings/regions/${id}`,
      payload
    );
    return data;
  },
  deleteRegion: async (id: number) => {
    const { data } = await apiClient.delete(`/settings/regions/${id}`);
    return data;
  },

  // Cities
  getCities: async (params?: SettingsListParams) => {
    const { data } = await apiClient.get<SettingsListResponse<City>>(
      "/settings/cities",
      { params }
    );
    return data;
  },
  createCity: async (payload: {
    name: string;
    display_name: string;
    region_id: number;
    is_active: boolean;
  }) => {
    const { data } = await apiClient.post<SingleResponse<City>>(
      "/settings/cities",
      payload
    );
    return data;
  },
  updateCity: async (
    id: number,
    payload: {
      name?: string;
      display_name?: string;
      region_id?: number;
      is_active?: boolean;
    }
  ) => {
    const { data } = await apiClient.put<SingleResponse<City>>(
      `/settings/cities/${id}`,
      payload
    );
    return data;
  },
  deleteCity: async (id: number) => {
    const { data } = await apiClient.delete(`/settings/cities/${id}`);
    return data;
  },

  // Areas
  getAreas: async (params?: SettingsListParams) => {
    const { data } = await apiClient.get<SettingsListResponse<Area>>(
      "/settings/areas",
      { params }
    );
    return data;
  },
  createArea: async (payload: {
    name: string;
    display_name: string;
    city_id: number;
    is_active: boolean;
  }) => {
    const { data } = await apiClient.post<SingleResponse<Area>>(
      "/settings/areas",
      payload
    );
    return data;
  },
  updateArea: async (
    id: number,
    payload: {
      name?: string;
      display_name?: string;
      city_id?: number;
      is_active?: boolean;
    }
  ) => {
    const { data } = await apiClient.put<SingleResponse<Area>>(
      `/settings/areas/${id}`,
      payload
    );
    return data;
  },
  deleteArea: async (id: number) => {
    const { data } = await apiClient.delete(`/settings/areas/${id}`);
    return data;
  },
};
