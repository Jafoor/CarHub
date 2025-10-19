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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VehicleType } from '@/types/vehicle-type';
import { MoreHorizontal, Edit, Trash2, Image } from 'lucide-react';

interface VehicleTypesTableProps {
  vehicleTypes: VehicleType[];
  loading?: boolean;
  onEdit: (vehicleType: VehicleType) => void;
  onDelete: (id: number) => void;
}

export function VehicleTypesTable({ 
  vehicleTypes, 
  loading, 
  onEdit, 
  onDelete 
}: VehicleTypesTableProps) {
  if (loading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading vehicle types...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicleTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No vehicle types found
              </TableCell>
            </TableRow>
          ) : (
            vehicleTypes.map((vehicleType) => (
              <TableRow key={vehicleType.id}>
                <TableCell>
                  {vehicleType.image ? (
                    <img 
                      src={vehicleType.image} 
                      alt={vehicleType.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Image className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{vehicleType.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {vehicleType.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={vehicleType.is_active ? "default" : "secondary"}>
                    {vehicleType.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(vehicleType.created_at).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => onEdit(vehicleType)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Vehicle Type
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(vehicleType.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Vehicle Type
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}