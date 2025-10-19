export interface Division {
  id: number;
  name: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface DivisionCreateInput {
  name: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
  priority: number;
}

export interface DivisionUpdateInput {
  name?: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active?: boolean;
  priority?: number;
}