import { z } from 'zod';

export const carImageSchema = z.object({
  image_url: z.string().url('Invalid image URL'),
  is_primary: z.boolean().default(false),
  alt_text: z.string().max(255, 'Alt text must be less than 255 characters').optional(),
  display_order: z.number().int().min(0).default(0),
});

export const carSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().max(500, 'Short description must be less than 500 characters').optional(),
  
  // Ownership
  owner_type: z.enum(['user', 'showroom'] as const, { error: 'Owner type is required' }),
  owner_id: z.number().min(1, 'Owner is required'),
  showroom_id: z.number().optional().nullable(),
  
  // Basic Information
  brand_id: z.number().min(1, 'Brand is required'),
  vehicle_type_id: z.number().min(1, 'Vehicle type is required'),
  model_name: z.string().min(1, 'Model name is required').max(100, 'Model name must be less than 100 characters'),
  model_year: z.number()
    .int('Model year must be a whole number')
    .min(1900, 'Model year must be after 1900')
    .max(2030, 'Model year cannot be in the future'),
  condition: z.enum(['brand_new', 'used', 'refurbished', 'reconditioned'] as const, { error: 'Condition is required' }),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(9999999999.99, 'Price is too high'),
  original_price: z.number()
    .min(0, 'Original price must be positive')
    .optional()
    .nullable(),
  is_negotiable: z.boolean().default(false),
  
  // Vehicle Details
  color: z.string().max(50, 'Color must be less than 50 characters').optional(),
  registration_year: z.number()
    .int('Registration year must be a whole number')
    .min(1900, 'Registration year must be after 1900')
    .max(new Date().getFullYear(), 'Registration year cannot be in the future')
    .optional()
    .nullable(),
  registration_city: z.string().max(100, 'Registration city must be less than 100 characters').optional(),
  mileage: z.number().min(0, 'Mileage must be positive').optional().nullable(),
  mileage_unit: z.string().default('km'),
  engine_capacity: z.number().min(0, 'Engine capacity must be positive').optional().nullable(),
  engine_capacity_unit: z.string().default('cc'),
  transmission: z.enum(['manual', 'automatic', 'semi_automatic', 'cvt']).optional().nullable(),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg']).optional().nullable(),
  body_type: z.string().max(50, 'Body type must be less than 50 characters').optional(),
  drive_type: z.enum(['fwd', 'rwd', 'awd', '4wd']).optional().nullable(),
  
  // Features and Specifications
  seating_capacity: z.number()
    .int('Seating capacity must be a whole number')
    .min(1, 'Seating capacity must be at least 1')
    .max(50, 'Seating capacity is too high')
    .optional()
    .nullable(),
  number_of_doors: z.number()
    .int('Number of doors must be a whole number')
    .min(1, 'Number of doors must be at least 1')
    .max(10, 'Number of doors is too high')
    .optional()
    .nullable(),
  features: z.any().optional(),
  specifications: z.any().optional(),
  
  // Location
  division_id: z.number().min(1, 'Division is required'),
  district_id: z.number().min(1, 'District is required'),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  
  // Status
  status: z.enum(['draft', 'published', 'sold', 'reserved', 'expired']).default('draft'),
  is_featured: z.boolean().default(false),
  is_verified: z.boolean().default(false),
  
  // Meta Information
  meta_title: z.string().max(255, 'Meta title must be less than 255 characters').optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  
  // Images
  images: z.array(carImageSchema).min(1, 'At least one image is required'),
});

export type CarFormData = z.infer<typeof carSchema>;