export interface District {
  id: number;
  division_id: number;
  division: {
    id: number;
    name: string;
    bn_name?: string;
  };
  name: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DistrictCreateInput {
  name: string;
  division_id: number;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
}

export interface DistrictUpdateInput {
  name?: string;
  division_id?: number;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active?: boolean;
}