'use client';

import { useState } from 'react';
import { VehicleTypesTable } from '@/components/tables/vehicle-types-table';
import { VehicleTypeForm } from '@/components/forms/vehicle-type-form';
import { SearchFilters } from '@/components/data/search-filters';
import { Pagination } from '@/components/data/pagination';
import { Button } from '@/components/ui/button';
import { VehicleType, VehicleTypeCreateInput } from '@/types/vehicle-type';
import { toast } from 'sonner';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { fetchVehicleTypes, createVehicleType, updateVehicleType, deleteVehicleType } from '@/lib/api/vehicle-types';

export default function VehicleTypesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);

  const {
    data: vehicleTypes,
    pagination,
    params,
    loading,
    error,
    setPage,
    setLimit,
    setSearch,
    updateParams,
    refetch,
  } = useDataFetching({
    fetchFunction: fetchVehicleTypes,
    initialParams: {},
  });

  const handleAddVehicleType = () => {
    setEditingVehicleType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle type?')) {
      try {
        await deleteVehicleType(id);
        toast.success('Vehicle type deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error('Delete failed', {
          description: error.message,
        });
      }
    }
  };

  const handleFormSuccess = async (formData: VehicleTypeCreateInput) => {
    try {
      if (editingVehicleType) {
        await updateVehicleType(editingVehicleType.id, formData);
        toast.success('Vehicle type updated successfully');
      } else {
        await createVehicleType(formData);
        toast.success('Vehicle type created successfully');
      }
      
      refetch();
      setIsFormOpen(false);
      setEditingVehicleType(null);
    } catch (error: any) {
      toast.error('Operation failed', {
        description: error.message,
      });
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    updateParams({ search: '' });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Types</h1>
            <p className="text-gray-600">Manage vehicle types and categories</p>
          </div>
          <Button onClick={handleAddVehicleType}>Add Vehicle Type</Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-red-600">
          <p>Error loading vehicle types: {error}</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Types</h1>
          <p className="text-gray-600">
            Manage vehicle types and categories with search and pagination
          </p>
        </div>
        <Button onClick={handleAddVehicleType}>Add Vehicle Type</Button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={params.search || ''}
        onSearchChange={setSearch}
        filters={[]}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search vehicle types..."
      />

      {/* Vehicle Types Table */}
      <VehicleTypesTable
        vehicleTypes={vehicleTypes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Vehicle Type Form */}
      <VehicleTypeForm
        vehicleType={editingVehicleType || undefined}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVehicleType(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}