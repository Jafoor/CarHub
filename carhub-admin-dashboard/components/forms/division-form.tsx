'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Division, DivisionCreateInput } from '@/types/division';
import { divisionSchema, DivisionFormData } from '@/lib/validation/division';

interface DivisionFormProps {
  division?: Division;
  open: boolean;
  onClose: () => void;
  onSuccess: (data: DivisionCreateInput) => void;
}

export function DivisionForm({ division, open, onClose, onSuccess }: DivisionFormProps) {
  const isEditing = !!division;

  const form = useForm<DivisionFormData>({
    resolver: zodResolver(divisionSchema) as any,
    defaultValues: {
      name: '',
      bn_name: '',
      lat: undefined,
      lon: undefined,
      is_active: true,
      priority: 0,
    },
  });

  useEffect(() => {
    if (division && open) {
      form.reset({
        name: division.name,
        bn_name: division.bn_name || '',
        lat: division.lat || undefined,
        lon: division.lon || undefined,
        is_active: division.is_active,
        priority: division.priority,
      });
    } else if (!open) {
      form.reset({
        name: '',
        bn_name: '',
        lat: undefined,
        lon: undefined,
        is_active: true,
        priority: 0,
      });
    }
  }, [division, open, form]);

  const onSubmit = async (data: DivisionFormData) => {
    try {
      await onSuccess(data);
    } catch (error) {
      console.error('Failed to save division:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Division' : 'Add New Division'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter division name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bangla Name Field */}
            <FormField
              control={form.control}
              name="bn_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bangla Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bangla name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coordinates Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Latitude Field */}
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="23.8103" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Longitude Field */}
              <FormField
                control={form.control}
                name="lon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="90.4125" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority Field */}
            <FormField
              control={form.control}
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
                    Higher priority divisions appear first (0 = lowest)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status Field */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Whether this division is active and visible
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
                {isEditing ? 'Update Division' : 'Create Division'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}