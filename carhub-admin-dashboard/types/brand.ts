export interface Brand {
  id: number;
  name: string;
  vehicle_type_id: number;
  vehicle_type: {
    id: number;
    name: string;
    image?: string;
  };
  image?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandCreateInput {
  name: string;
  vehicle_type_id: number;
  image?: string;
  is_active: boolean;
  description?: string;
}

export interface BrandUpdateInput {
  name?: string;
  vehicle_type_id?: number;
  image?: string;
  is_active?: boolean;
  description?: string;
}