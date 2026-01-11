'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Showroom, ShowroomCreateInput } from '@/types/showroom';
import { Division } from '@/types/division';
import { District } from '@/types/district';
import { User } from '@/types/user';
import { showroomSchema, ShowroomFormData } from '@/lib/validation/showroom';

interface ShowroomFormProps {
  showroom?: Showroom;
  divisions: Division[];
  districts: District[];
  users: User[];
  open: boolean;
  onClose: () => void;
  onSuccess: (data: ShowroomCreateInput) => void;
}

export function ShowroomForm({ 
  showroom, 
  divisions, 
  districts, 
  users, 
  open, 
  onClose, 
  onSuccess 
}: ShowroomFormProps) {
  const isEditing = !!showroom;
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>(districts);

  const form = useForm<ShowroomFormData>({
    resolver: zodResolver(showroomSchema) as any,
    defaultValues: {
      owner_id: 0,
      name: '',
      description: '',
      logo_url: '',
      cover_photo_url: '',
      phone: '',
      email: '',
      website: '',
      latitude: undefined,
      longitude: undefined,
      address: '',
      division_id: 0,
      district_id: 0,
      zip_code: '',
      opening_hours: {},
      services: [],
      social_links: {},
      status: 'active',
    },
  });

  const selectedDivisionId = form.watch('division_id');

  // Filter districts when division changes
  useEffect(() => {
    if (selectedDivisionId > 0) {
      const filtered = districts.filter(district => district.division_id === selectedDivisionId);
      setFilteredDistricts(filtered);
      
      // Reset district if it doesn't belong to selected division
      const currentDistrictId = form.getValues('district_id');
      if (currentDistrictId > 0 && !filtered.some(d => d.id === currentDistrictId)) {
        form.setValue('district_id', 0);
      }
    } else {
      setFilteredDistricts(districts);
    }
  }, [selectedDivisionId, districts, form]);

  useEffect(() => {
    if (showroom && open) {
      form.reset({
        owner_id: showroom.owner_id,
        name: showroom.name,
        description: showroom.description || '',
        logo_url: showroom.logo_url || '',
        cover_photo_url: showroom.cover_photo_url || '',
        phone: showroom.phone,
        email: showroom.email || '',
        website: showroom.website || '',
        latitude: showroom.latitude || undefined,
        longitude: showroom.longitude || undefined,
        address: showroom.address,
        division_id: showroom.division_id,
        district_id: showroom.district_id,
        zip_code: showroom.zip_code || '',
        opening_hours: showroom.opening_hours || {},
        services: showroom.services || [],
        social_links: showroom.social_links || {},
        status: showroom.status,
      });
    } else if (!open) {
      form.reset({
        owner_id: 0,
        name: '',
        description: '',
        logo_url: '',
        cover_photo_url: '',
        phone: '',
        email: '',
        website: '',
        latitude: undefined,
        longitude: undefined,
        address: '',
        division_id: 0,
        district_id: 0,
        zip_code: '',
        opening_hours: {},
        services: [],
        social_links: {},
        status: 'active',
      });
    }
  }, [showroom, open, form]);

  const onSubmit = async (data: ShowroomFormData) => {
    try {
      await onSuccess(data);
    } catch (error) {
      console.error('Failed to save showroom:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Showroom' : 'Add New Showroom'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              {/* Owner Field */}
              <FormField
                control={form.control}
                name="owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Showroom Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter showroom name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter showroom description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Website Field */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media URLs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Logo URL Field */}
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cover Photo URL Field */}
              <FormField
                control={form.control}
                name="cover_photo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Photo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/cover.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Division Field */}
                <FormField
                  control={form.control}
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
                            <SelectValue placeholder="Select division" />
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

                {/* District Field */}
                <FormField
                  control={form.control}
                  name="district_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString()}
                        disabled={!selectedDivisionId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedDivisionId ? "Select district" : "Select division first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.id.toString()}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Field */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter full address" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                {/* Zip Code Field */}
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter zip code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Latitude Field */}
                <FormField
                  control={form.control}
                  name="latitude"
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
                  name="longitude"
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
            </div>

            {/* JSON Fields - Simple Implementation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="opening_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Hours (JSON)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"monday": "9:00 AM - 6:00 PM", ...}'
                        className="min-h-[100px] font-mono text-sm"
                        {...field}
                        value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                        onChange={(e) => {
                          try {
                            const value = e.target.value ? JSON.parse(e.target.value) : {};
                            field.onChange(value);
                          } catch {
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter opening hours as JSON object
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services (JSON Array)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='["Car Sales", "Service Center", "Spare Parts"]'
                        className="min-h-[80px] font-mono text-sm"
                        {...field}
                        value={Array.isArray(field.value) ? JSON.stringify(field.value, null, 2) : field.value || ''}
                        onChange={(e) => {
                          try {
                            const value = e.target.value ? JSON.parse(e.target.value) : [];
                            field.onChange(value);
                          } catch {
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="social_links"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Links (JSON)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"facebook": "https://facebook.com/page", "instagram": "https://instagram.com/page"}'
                        className="min-h-[80px] font-mono text-sm"
                        {...field}
                        value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                        onChange={(e) => {
                          try {
                            const value = e.target.value ? JSON.parse(e.target.value) : {};
                            field.onChange(value);
                          } catch {
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
                {isEditing ? 'Update Showroom' : 'Create Showroom'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}