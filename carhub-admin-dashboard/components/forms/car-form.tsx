'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Car, CarCreateInput } from '@/types/car';
import { Brand } from '@/types/brand';
import { VehicleType } from '@/types/vehicle-type';
import { Division } from '@/types/division';
import { District } from '@/types/district';
import { User } from '@/types/user';
import { Showroom } from '@/types/showroom';
import { carSchema, CarFormData } from '@/lib/validation/car';
import { Plus, Trash2, Image as ImageIcon, Star, MoveUp, MoveDown } from 'lucide-react';

interface CarFormProps {
  car?: Car;
  brands: Brand[];
  vehicleTypes: VehicleType[];
  divisions: Division[];
  districts: District[];
  users: User[];
  showrooms: Showroom[];
  open: boolean;
  onClose: () => void;
  onSuccess: (data: CarCreateInput) => void;
}

export function CarForm({ 
  car, 
  brands, 
  vehicleTypes, 
  divisions, 
  districts, 
  users, 
  showrooms, 
  open, 
  onClose, 
  onSuccess 
}: CarFormProps) {
  const isEditing = !!car;
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>(districts);
  const [filteredShowrooms, setFilteredShowrooms] = useState<Showroom[]>(showrooms);

  const form = useForm<CarFormData>({
    resolver: zodResolver(carSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      owner_type: 'user',
      owner_id: 0,
      showroom_id: undefined,
      brand_id: 0,
      vehicle_type_id: 0,
      model_name: '',
      model_year: new Date().getFullYear(),
      condition: 'used',
      price: 0,
      original_price: undefined,
      is_negotiable: false,
      color: '',
      registration_year: undefined,
      registration_city: '',
      mileage: undefined,
      mileage_unit: 'km',
      engine_capacity: undefined,
      engine_capacity_unit: 'cc',
      transmission: undefined,
      fuel_type: undefined,
      body_type: '',
      drive_type: undefined,
      seating_capacity: undefined,
      number_of_doors: undefined,
      features: {},
      specifications: {},
      division_id: 0,
      district_id: 0,
      address: '',
      latitude: undefined,
      longitude: undefined,
      status: 'draft',
      is_featured: false,
      is_verified: false,
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      images: [{ image_url: '', is_primary: true, alt_text: '', display_order: 0 }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const selectedDivisionId = form.watch('division_id');
  const selectedOwnerType = form.watch('owner_type');
  const selectedOwnerId = form.watch('owner_id');

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

  // Filter showrooms when owner type changes
  useEffect(() => {
    if (selectedOwnerType === 'showroom') {
      setFilteredShowrooms(showrooms);
    } else {
      setFilteredShowrooms(showrooms);
    }
  }, [selectedOwnerType, showrooms]);

  // Reset form when opening/closing
  useEffect(() => {
    if (car && open) {
      const carData = {
        ...car,
        showroom_id: car.showroom_id || undefined,
        original_price: car.original_price || undefined,
        registration_year: car.registration_year || undefined,
        mileage: car.mileage || undefined,
        engine_capacity: car.engine_capacity || undefined,
        latitude: car.latitude || undefined,
        longitude: car.longitude || undefined,
        images: car.images.map(img => ({
          image_url: img.image_url,
          is_primary: img.is_primary,
          alt_text: img.alt_text || '',
          display_order: img.display_order,
        })),
      };
      form.reset(carData);
    } else if (!open) {
      form.reset({
        title: '',
        description: '',
        short_description: '',
        owner_type: 'user',
        owner_id: 0,
        showroom_id: undefined,
        brand_id: 0,
        vehicle_type_id: 0,
        model_name: '',
        model_year: new Date().getFullYear(),
        condition: 'used',
        price: 0,
        original_price: undefined,
        is_negotiable: false,
        color: '',
        registration_year: undefined,
        registration_city: '',
        mileage: undefined,
        mileage_unit: 'km',
        engine_capacity: undefined,
        engine_capacity_unit: 'cc',
        transmission: undefined,
        fuel_type: undefined,
        body_type: '',
        drive_type: undefined,
        seating_capacity: undefined,
        number_of_doors: undefined,
        features: {},
        specifications: {},
        division_id: 0,
        district_id: 0,
        address: '',
        latitude: undefined,
        longitude: undefined,
        status: 'draft',
        is_featured: false,
        is_verified: false,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        images: [{ image_url: '', is_primary: true, alt_text: '', display_order: 0 }],
      });
    }
  }, [car, open, form]);

  const onSubmit = async (data: CarFormData) => {
    try {
      const payload = {
        ...data,
        showroom_id: data.showroom_id === null ? undefined : data.showroom_id,
        original_price: data.original_price ?? undefined,
      } as CarCreateInput;
      await onSuccess(payload);
    } catch (error) {
      console.error('Failed to save car:', error);
    }
  };

  const addImage = () => {
    append({
      image_url: '',
      is_primary: false,
      alt_text: '',
      display_order: fields.length,
    });
  };

  const removeImage = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const moveImageUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const moveImageDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  const setPrimaryImage = (index: number) => {
    fields.forEach((_, i) => {
      form.setValue(`images.${i}.is_primary`, i === index);
    });
  };

  // Helper function for number inputs
  const renderNumberInput = (field: any, placeholder: string, step?: string, min?: number, max?: number) => {
    const { onChange, onBlur, name, ref, value } = field;
    return (
      <Input 
        type="number" 
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        name={name}
        ref={ref}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        value={value ?? ''}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Car' : 'Add New Car'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Toyota Corolla X 2022" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Model Name */}
                <FormField
                  control={form.control}
                  name="model_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Corolla X" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Short Description */}
              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description (appears in listings)"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum 500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the car, features, condition, etc."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ownership Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ownership</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Owner Type */}
                <FormField
                  control={form.control}
                  name="owner_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Type *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select owner type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Individual User</SelectItem>
                          <SelectItem value="showroom">Showroom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Owner */}
                <FormField
                  control={form.control}
                  name="owner_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedOwnerType === 'user' ? 'User *' : 'Showroom *'}
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${selectedOwnerType}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedOwnerType === 'user' ? (
                            users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.full_name} ({user.email})
                              </SelectItem>
                            ))
                          ) : (
                            showrooms.map((showroom) => (
                              <SelectItem key={showroom.id} value={showroom.id.toString()}>
                                {showroom.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Showroom Assignment (for individual users) */}
              {selectedOwnerType === 'user' && (
                <FormField
                  control={form.control}
                  name="showroom_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Showroom (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select showroom (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {showrooms.map((showroom) => (
                            <SelectItem key={showroom.id} value={showroom.id.toString()}>
                              {showroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assign this car to a showroom for better visibility
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Vehicle Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Vehicle Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Brand */}
                <FormField
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vehicle Type */}
                <FormField
                  control={form.control}
                  name="vehicle_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Model Year */}
                <FormField
                  control={form.control}
                  name="model_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Year *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1900"
                          max="2030"
                          placeholder="2023"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Condition */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="brand_new">Brand New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                          <SelectItem value="reconditioned">Reconditioned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transmission */}
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="semi_automatic">Semi-Automatic</SelectItem>
                          <SelectItem value="cvt">CVT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fuel Type */}
                <FormField
                  control={form.control}
                  name="fuel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="cng">CNG</SelectItem>
                          <SelectItem value="lpg">LPG</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Color */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Red, Black, White" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Body Type */}
                <FormField
                  control={form.control}
                  name="body_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sedan, SUV, Hatchback" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Engine Capacity */}
                <FormField
                  control={form.control}
                  name="engine_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Capacity</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, "1500", "0.1")}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mileage */}
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, "25000", "0.01")}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Registration Year */}
                <FormField
                  control={form.control}
                  name="registration_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Year</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, "2022", "1", 1900, new Date().getFullYear())}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Seating Capacity */}
                <FormField
                  control={form.control}
                  name="seating_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Capacity</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, "5", "1", 1, 50)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Number of Doors */}
                <FormField
                  control={form.control}
                  name="number_of_doors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Doors</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, "4", "1", 1, 10)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (BDT) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="2500000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Original Price */}
                <FormField
                  control={form.control}
                  name="original_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (BDT)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="2800000"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Show discount if different from current price
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Negotiable Switch */}
              <FormField
                control={form.control}
                name="is_negotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Price Negotiable</FormLabel>
                      <FormDescription>
                        Allow buyers to negotiate the price
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
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Division */}
                <FormField
                  control={form.control}
                  name="division_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
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

                {/* District */}
                <FormField
                  control={form.control}
                  name="district_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
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

              {/* Address */}
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

              {/* Drive Type - Add this field */}
<FormField
  control={form.control}
  name="drive_type"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Drive Type *</FormLabel>
      <Select 
        onValueChange={field.onChange} 
        value={field.value || 'fwd'}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select drive type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="fwd">Front Wheel Drive (FWD)</SelectItem>
          <SelectItem value="rwd">Rear Wheel Drive (RWD)</SelectItem>
          <SelectItem value="awd">All Wheel Drive (AWD)</SelectItem>
          <SelectItem value="4wd">Four Wheel Drive (4WD)</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

              <div className="grid grid-cols-2 gap-4">
                {/* Latitude */}
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, "23.8103", "any")}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Longitude */}
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, "90.4125", "any")}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Images</h3>
                <Button type="button" onClick={addImage} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Image
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Image {index + 1}</span>
                        {form.watch(`images.${index}.is_primary`) && (
                          <Badge variant="default" className="flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveImageUp(index)}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveImageDown(index)}
                          disabled={index === fields.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryImage(index)}
                          disabled={form.watch(`images.${index}.is_primary`)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`images.${index}.image_url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL *</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`images.${index}.alt_text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alt Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Description of the image" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch(`images.${index}.image_url`) && (
                      <div className="mt-2">
                        <img 
                          src={form.watch(`images.${index}.image_url`)} 
                          alt="Preview" 
                          className="h-32 w-48 object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status and Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status & Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Listing</FormLabel>
                        <FormDescription>
                          Show this car in featured sections
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

                <FormField
                  control={form.control}
                  name="is_verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Verified Listing</FormLabel>
                        <FormDescription>
                          Mark this listing as verified for trust
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
              </div>
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
                {isEditing ? 'Update Car' : 'Create Car'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}