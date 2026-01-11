import { z } from 'zod';

export const showroomSchema = z.object({
  owner_id: z.number().min(1, 'Owner is required'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be less than 150 characters'),
  description: z.string().optional(),
  logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  cover_photo_url: z.string().url('Invalid cover photo URL').optional().or(z.literal('')),
  phone: z.string()
    .min(5, 'Phone must be at least 5 characters')
    .max(30, 'Phone must be less than 30 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address must be less than 255 characters'),
  division_id: z.number().min(1, 'Please select a division'),
  district_id: z.number().min(1, 'Please select a district'),
  zip_code: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  opening_hours: z.any().optional(),
  services: z.any().optional(),
  social_links: z.any().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

export type ShowroomFormData = z.infer<typeof showroomSchema>;