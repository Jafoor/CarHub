import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  vehicle_type_id: z.number()
    .min(1, 'Please select a vehicle type')
    .positive('Please select a valid vehicle type'),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type BrandFormData = z.infer<typeof brandSchema>;