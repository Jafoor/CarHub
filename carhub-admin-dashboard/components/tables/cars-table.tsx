'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Car } from '@/types/car';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  MapPin, 
  Star, 
  CheckCircle, 
  XCircle, 
  Car as CarIcon,
  Eye,
  TrendingUp
} from 'lucide-react';
import {  } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/index';

interface CarsTableProps {
  cars: Car[];
  loading?: boolean;
  onEdit: (car: Car) => void;
  onDelete: (id: number) => void;
  onStatusUpdate: (id: number, status: string) => void;
  onToggleFeatured: (id: number, featured: boolean) => void;
  onToggleVerified: (id: number, verified: boolean) => void;
}

export function CarsTable({ 
  cars, 
  loading, 
  onEdit, 
  onDelete,
  onStatusUpdate,
  onToggleFeatured,
  onToggleVerified
}: CarsTableProps) {
  if (loading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading cars...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      sold: 'default',
      reserved: 'default',
      expired: 'destructive',
    } as const;

    const labels = {
      draft: 'Draft',
      published: 'Published',
      sold: 'Sold',
      reserved: 'Reserved',
      expired: 'Expired',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    const variants = {
      brand_new: 'default',
      used: 'secondary',
      refurbished: 'outline',
      reconditioned: 'outline',
    } as const;

    const labels = {
      brand_new: 'Brand New',
      used: 'Used',
      refurbished: 'Refurbished',
      reconditioned: 'Reconditioned',
    };

    return (
      <Badge variant={variants[condition as keyof typeof variants]}>
        {labels[condition as keyof typeof labels]}
      </Badge>
    );
  };

  const getPrimaryImage = (car: Car) => {
    const primaryImage = car.images.find(img => img.is_primary);
    return primaryImage || car.images[0];
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Car</TableHead>
            <TableHead>Brand & Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cars.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                No cars found
              </TableCell>
            </TableRow>
          ) : (
            cars.map((car) => {
              const primaryImage = getPrimaryImage(car);
              
              return (
                <TableRow key={car.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {primaryImage ? (
                        <img 
                          src={primaryImage.image_url} 
                          alt={primaryImage.alt_text || car.title}
                          className="h-12 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                          <CarIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <div className="max-w-[200px]">
                        <div className="font-medium line-clamp-2">{car.title}</div>
                        <div className="text-sm text-gray-500">
                          {car.model_name} • {car.transmission ? car.transmission.replace('_', ' ') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{car.brand.name}</div>
                      <div className="text-sm text-gray-500">{car.vehicle_type.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatPrice(car.price)}</div>
                      {car.original_price && car.original_price > car.price && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(car.original_price)}
                        </div>
                      )}
                      {car.is_negotiable && (
                        <Badge variant="outline" className="text-xs">Negotiable</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getConditionBadge(car.condition)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{car.model_year}</div>
                    {car.registration_year && (
                      <div className="text-sm text-gray-500">Reg: {car.registration_year}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px]">
                      <div className="flex items-center space-x-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{car.district.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {car.division.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={car.status}
                      onValueChange={(value) => onStatusUpdate(car.id, value)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[120px]">
                      <div className="text-sm font-medium">
                        {car.owner_type === 'showroom' && car.showroom ? car.showroom.name : car.owner.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {car.owner_type}
                        {car.showroom && car.owner_type === 'user' && ' (Showroom)'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{car.view_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={car.is_featured}
                      onCheckedChange={(checked) => onToggleFeatured(car.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={car.is_verified}
                      onCheckedChange={(checked) => onToggleVerified(car.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(car)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Car
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(car.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Car
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}