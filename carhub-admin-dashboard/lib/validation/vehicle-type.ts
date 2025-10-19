import { z } from 'zod';

export const vehicleTypeSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  priority: z.number()
    .int('Priority must be a whole number')
    .min(0, 'Priority must be 0 or greater')
    .default(0),
});

export type VehicleTypeFormData = z.infer<typeof vehicleTypeSchema>;