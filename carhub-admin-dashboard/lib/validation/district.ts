import { z } from 'zod';

export const districtSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  division_id: z.number()
    .min(1, 'Please select a division')
    .positive('Please select a valid division'),
  bn_name: z.string().max(100, 'Bangla name must be less than 100 characters').optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  is_active: z.boolean().default(true),
});

export type DistrictFormData = z.infer<typeof districtSchema>;