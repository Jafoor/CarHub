export interface Showroom {
  id: number;
  owner_id: number;
  owner: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  name: string;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  phone: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address: string;
  division_id: number;
  division: {
    id: number;
    name: string;
    bn_name?: string;
  };
  district_id: number;
  district: {
    id: number;
    name: string;
    bn_name?: string;
  };
  zip_code?: string;
  opening_hours?: any;
  verified: boolean;
  rating: number;
  total_reviews: number;
  services?: any;
  social_links?: any;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface ShowroomCreateInput {
  owner_id: number;
  name: string;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  phone: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address: string;
  division_id: number;
  district_id: number;
  zip_code?: string;
  opening_hours?: any;
  services?: any;
  social_links?: any;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ShowroomUpdateInput {
  name?: string;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  division_id?: number;
  district_id?: number;
  zip_code?: string;
  opening_hours?: any;
  services?: any;
  social_links?: any;
  status?: 'active' | 'inactive' | 'suspended';
}