import { z } from 'zod';

export const divisionSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  bn_name: z.string().max(100, 'Bangla name must be less than 100 characters').optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  is_active: z.boolean().default(true),
  priority: z.number()
    .int('Priority must be a whole number')
    .min(0, 'Priority must be 0 or greater')
    .default(0),
});

export type DivisionFormData = z.infer<typeof divisionSchema>;