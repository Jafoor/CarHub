export interface VehicleType {
  id: number;
  name: string;
  image?: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleTypeCreateInput {
  name: string;
  image?: string;
  is_active: boolean;
  priority: number;
}

export interface VehicleTypeUpdateInput {
  name?: string;
  image?: string;
  is_active?: boolean;
  priority?: number;
}