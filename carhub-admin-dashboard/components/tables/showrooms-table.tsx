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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Showroom } from '@/types/showroom';
import { MoreHorizontal, Edit, Trash2, MapPin, Star, CheckCircle, XCircle, Building } from 'lucide-react';

interface ShowroomsTableProps {
  showrooms: Showroom[];
  loading?: boolean;
  onEdit: (showroom: Showroom) => void;
  onDelete: (id: number) => void;
  onToggleVerification: (id: number, verified: boolean) => void;
  onStatusUpdate: (id: number, status: string) => void;
}

export function ShowroomsTable({ 
  showrooms, 
  loading, 
  onEdit, 
  onDelete,
  onToggleVerification,
  onStatusUpdate
}: ShowroomsTableProps) {
  if (loading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading showrooms...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusChange = (showroomId: number, newStatus: string) => {
    onStatusUpdate(showroomId, newStatus);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Showroom</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showrooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No showrooms found
              </TableCell>
            </TableRow>
          ) : (
            showrooms.map((showroom) => (
              <TableRow key={showroom.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {showroom.logo_url ? (
                      <img 
                        src={showroom.logo_url} 
                        alt={showroom.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{showroom.name}</div>
                      <div className="text-sm text-gray-500">
                        {showroom.division.name} → {showroom.district.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{showroom.owner.name}</div>
                    <div className="text-sm text-gray-500">{showroom.owner.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{showroom.phone}</div>
                    {showroom.email && (
                      <div className="text-sm text-gray-500">{showroom.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <div className="text-sm">{showroom.address}</div>
                    {showroom.latitude && showroom.longitude && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {showroom.latitude.toFixed(4)}, {showroom.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{showroom.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({showroom.total_reviews})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={showroom.status}
                    onValueChange={(value) => handleStatusChange(showroom.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant={showroom.verified ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleVerification(showroom.id, !showroom.verified)}
                  >
                    {showroom.verified ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {showroom.verified ? 'Verified' : 'Verify'}
                  </Button>
                </TableCell>
                <TableCell>
                  {new Date(showroom.created_at).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => onEdit(showroom)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Showroom
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(showroom.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Showroom
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