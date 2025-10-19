'use client';

import { useEffect } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { VehicleType, VehicleTypeCreateInput } from '@/types/vehicle-type';
import { vehicleTypeSchema, VehicleTypeFormData } from '@/lib/validation/vehicle-type';

interface VehicleTypeFormProps {
  vehicleType?: VehicleType;
  open: boolean;
  onClose: () => void;
  onSuccess: (data: VehicleTypeCreateInput) => void;
}

export function VehicleTypeForm({ vehicleType, open, onClose, onSuccess }: VehicleTypeFormProps) {
  const isEditing = !!vehicleType;

  const form = useForm<VehicleTypeFormData>({
    resolver: zodResolver(vehicleTypeSchema) as any,
    defaultValues: {
      name: '',
      image: '',
      is_active: true,
      priority: 0,
    },
  });

  useEffect(() => {
    if (vehicleType && open) {
      form.reset({
        name: vehicleType.name,
        image: vehicleType.image || '',
        is_active: vehicleType.is_active,
        priority: vehicleType.priority,
      });
    } else if (!open) {
      form.reset({
        name: '',
        image: '',
        is_active: true,
        priority: 0,
      });
    }
  }, [vehicleType, open, form]);

  const onSubmit = async (data: VehicleTypeFormData) => {
    try {
      await onSuccess(data);
    } catch (error) {
      console.error('Failed to save vehicle type:', error);
    }
  };

  // helper to satisfy FormField's expected Control generic
  const typedControl = form.control as unknown as Control<VehicleTypeFormData>;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={typedControl}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vehicle type name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Field */}
            <FormField
              control={typedControl}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter image URL" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Provide a URL for the vehicle type image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Field */}
            <FormField
              control={typedControl}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter priority" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Higher priority types appear first (0 = lowest)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status Field */}
            <FormField
              control={typedControl}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Whether this vehicle type is active and visible
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Vehicle Type' : 'Create Vehicle Type'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}