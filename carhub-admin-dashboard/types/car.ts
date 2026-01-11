export interface Car {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  
  // Ownership and Assignment
  owner_type: 'user' | 'showroom';
  owner_id: number;
  owner: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  showroom_id?: number;
  showroom?: {
    id: number;
    name: string;
    phone: string;
    verified: boolean;
  };
  
  // Basic Information
  brand_id: number;
  brand: {
    id: number;
    name: string;
    image?: string;
  };
  vehicle_type_id: number;
  vehicle_type: {
    id: number;
    name: string;
    image?: string;
  };
  model_name: string;
  model_year: number;
  condition: 'brand_new' | 'used' | 'refurbished' | 'reconditioned';
  
  // Pricing
  price: number;
  original_price?: number;
  is_negotiable: boolean;
  
  // Vehicle Details
  color?: string;
  registration_year?: number;
  registration_city?: string;
  mileage?: number;
  mileage_unit: string;
  engine_capacity?: number;
  engine_capacity_unit: string;
  transmission?: 'manual' | 'automatic' | 'semi_automatic' | 'cvt';
  fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'lpg';
  body_type?: string;
  drive_type?: 'fwd' | 'rwd' | 'awd' | '4wd';
  
  // Features and Specifications
  seating_capacity?: number;
  number_of_doors?: number;
  features?: any;
  specifications?: any;
  
  // Location
  division_id: number;
  division: {
    id: number;
    name: string;
  };
  district_id: number;
  district: {
    id: number;
    name: string;
  };
  address?: string;
  latitude?: number;
  longitude?: number;
  
  // Status and Visibility
  status: 'draft' | 'published' | 'sold' | 'reserved' | 'expired';
  is_featured: boolean;
  is_verified: boolean;
  view_count: number;
  
  // Images
  images: CarImage[];
  
  created_at: string;
  updated_at: string;
}

export interface CarImage {
  id: number;
  car_id: number;
  image_url: string;
  is_primary: boolean;
  alt_text?: string;
  display_order: number;
  created_at: string;
}

export interface CarCreateInput {
  title: string;
  description: string;
  short_description?: string;
  
  // Ownership
  owner_type: 'user' | 'showroom';
  owner_id: number;
  showroom_id?: number;
  
  // Basic Information
  brand_id: number;
  vehicle_type_id: number;
  model_name: string;
  model_year: number;
  condition: 'brand_new' | 'used' | 'refurbished' | 'reconditioned';
  
  // Pricing
  price: number;
  original_price?: number;
  is_negotiable: boolean;
  
  // Vehicle Details
  color?: string;
  registration_year?: number;
  registration_city?: string;
  mileage?: number;
  mileage_unit?: string;
  engine_capacity?: number;
  engine_capacity_unit?: string;
  transmission?: 'manual' | 'automatic' | 'semi_automatic' | 'cvt';
  fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'lpg';
  body_type?: string;
  drive_type?: 'fwd' | 'rwd' | 'awd' | '4wd';
  
  // Features and Specifications
  seating_capacity?: number;
  number_of_doors?: number;
  features?: any;
  specifications?: any;
  
  // Location
  division_id: number;
  district_id: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  // Status
  status?: 'draft' | 'published' | 'sold' | 'reserved' | 'expired';
  is_featured?: boolean;
  is_verified?: boolean;
  
  // Images
  images: CarImageInput[];
}

export interface CarImageInput {
  image_url: string;
  is_primary: boolean;
  alt_text?: string;
  display_order: number;
}

export interface CarUpdateInput {
  title?: string;
  description?: string;
  short_description?: string;
  
  // Ownership
  owner_type?: 'user' | 'showroom';
  owner_id?: number;
  showroom_id?: number;
  
  // Basic Information
  brand_id?: number;
  vehicle_type_id?: number;
  model_name?: string;
  model_year?: number;
  condition?: 'brand_new' | 'used' | 'refurbished' | 'reconditioned';
  
  // Pricing
  price?: number;
  original_price?: number;
  is_negotiable?: boolean;
  
  // Vehicle Details
  color?: string;
  registration_year?: number;
  registration_city?: string;
  mileage?: number;
  mileage_unit?: string;
  engine_capacity?: number;
  engine_capacity_unit?: string;
  transmission?: 'manual' | 'automatic' | 'semi_automatic' | 'cvt';
  fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'lpg';
  body_type?: string;
  drive_type?: 'fwd' | 'rwd' | 'awd' | '4wd';
  
  // Features and Specifications
  seating_capacity?: number;
  number_of_doors?: number;
  features?: any;
  specifications?: any;
  
  // Location
  division_id?: number;
  district_id?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  // Status
  status?: 'draft' | 'published' | 'sold' | 'reserved' | 'expired';
  is_featured?: boolean;
  is_verified?: boolean;
  
  // Images
  images?: CarImageInput[];
}

export interface CarFilters {
  search?: string;
  brand_id?: number;
  vehicle_type_id?: number;
  condition?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  transmission?: string;
  fuel_type?: string;
  status?: string;
  owner_type?: string;
  owner_id?: number;
  showroom_id?: number;
  division_id?: number;
  district_id?: number;
  is_featured?: boolean;
  is_verified?: boolean;
  is_negotiable?: boolean;
}