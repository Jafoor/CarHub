'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { District, DistrictCreateInput } from '@/types/district';
import { Division } from '@/types/division';
import { districtSchema, DistrictFormData } from '@/lib/validation/district';

interface DistrictFormProps {
  district?: District;
  divisions: Division[];
  open: boolean;
  onClose: () => void;
  onSuccess: (data: DistrictCreateInput) => void;
}

export function DistrictForm({ 
  district, 
  divisions, 
  open, 
  onClose, 
  onSuccess 
}: DistrictFormProps) {
  const isEditing = !!district;

  const form = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema) as any,
    defaultValues: {
      name: '',
      division_id: 0,
      bn_name: '',
      lat: undefined,
      lon: undefined,
      is_active: true,
    },
  });

  useEffect(() => {
    if (district && open) {
      form.reset({
        name: district.name,
        division_id: district.division_id,
        bn_name: district.bn_name || '',
        lat: district.lat || undefined,
        lon: district.lon || undefined,
        is_active: district.is_active,
      });
    } else if (!open) {
      form.reset({
        name: '',
        division_id: 0,
        bn_name: '',
        lat: undefined,
        lon: undefined,
        is_active: true,
      });
    }
  }, [district, open, form]);

  const onSubmit: SubmitHandler<DistrictFormData> = async (data) => {
    try {
      await onSuccess(data);
    } catch (error) {
      console.error('Failed to save district:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit District' : 'Add New District'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter district name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bangla Name Field */}
            <FormField
              control={form.control as any}
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

            {/* Division Field */}
            <FormField
              control={form.control as any}
              name="division_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id.toString()}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coordinates Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Latitude Field */}
              <FormField
                control={form.control as any}
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
                control={form.control as any}
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

            {/* Active Status Field */}
            <FormField
              control={form.control as any}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Whether this district is active and visible
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
              <Button type="submit" disabled={!form.formState.isValid}>
                {isEditing ? 'Update District' : 'Create District'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}