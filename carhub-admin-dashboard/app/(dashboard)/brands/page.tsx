'use client';

import { useState, useEffect } from 'react';
import { BrandsTable } from '@/components/tables/brands-table';
import { BrandForm } from '@/components/forms/brand-form';
import { SearchFilters } from '@/components/data/search-filters';
import { Pagination } from '@/components/data/pagination';
import { Button } from '@/components/ui/button';
import { Brand, BrandCreateInput } from '@/types/brand';
import { VehicleType } from '@/types/vehicle-type';
import { toast } from 'sonner';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '@/lib/api/brands';
import { fetchAllVehicleTypes } from '@/lib/api/vehicle-types';

export default function BrandsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');

  const {
    data: brands,
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
    fetchFunction: fetchBrands,
    initialParams: {},
  });

  // Load vehicle types for filter and form
  useEffect(() => {
    const loadVehicleTypes = async () => {
      try {
        const types = await fetchAllVehicleTypes();
        setVehicleTypes(types);
      } catch (error) {
        console.error('Failed to load vehicle types:', error);
      }
    };

    loadVehicleTypes();
  }, []);

  const handleAddBrand = () => {
    setEditingBrand(null);
    setIsFormOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id);
        toast.success('Brand deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error('Delete failed', {
          description: error.message,
        });
      }
    }
  };

  const handleFormSuccess = async (formData: BrandCreateInput) => {
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, formData);
        toast.success('Brand updated successfully');
      } else {
        await createBrand(formData);
        toast.success('Brand created successfully');
      }
      
      refetch();
      setIsFormOpen(false);
      setEditingBrand(null);
    } catch (error: any) {
      toast.error('Operation failed', {
        description: error.message,
      });
    }
  };

  const handleVehicleTypeFilterChange = (value: string) => {
    setVehicleTypeFilter(value);
    updateParams({ 
      vehicle_type_id: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setVehicleTypeFilter('all');
    updateParams({ 
      search: '',
      vehicle_type_id: undefined
    });
  };

  const filters = [
    {
      key: 'vehicle_type',
      label: 'Vehicle Type',
      options: [
        { value: 'all', label: 'All Types' },
        ...vehicleTypes.map(type => ({
          value: type.id.toString(),
          label: type.name
        }))
      ],
      value: vehicleTypeFilter,
      onChange: handleVehicleTypeFilterChange,
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
            <p className="text-gray-600">Manage vehicle brands</p>
          </div>
          <Button onClick={handleAddBrand}>Add Brand</Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-red-600">
          <p>Error loading brands: {error}</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-gray-600">
            Manage vehicle brands with search, filters, and pagination
          </p>
        </div>
        <Button onClick={handleAddBrand}>Add Brand</Button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={params.search || ''}
        onSearchChange={setSearch}
        filters={filters}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search brands..."
      />

      {/* Brands Table */}
      <BrandsTable
        brands={brands}
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

      {/* Brand Form */}
      <BrandForm
        brand={editingBrand || undefined}
        vehicleTypes={vehicleTypes}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBrand(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}