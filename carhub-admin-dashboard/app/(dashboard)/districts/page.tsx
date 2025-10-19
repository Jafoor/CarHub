'use client';

import { useState, useEffect } from 'react';
import { DistrictsTable } from '@/components/tables/districts-table';
import { DistrictForm } from '@/components/forms/district-form';
import { SearchFilters } from '@/components/data/search-filters';
import { Pagination } from '@/components/data/pagination';
import { Button } from '@/components/ui/button';
import { District, DistrictCreateInput } from '@/types/district';
import { Division } from '@/types/division';
import { toast } from 'sonner';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { fetchDistricts, createDistrict, updateDistrict, deleteDistrict } from '@/lib/api/districts';
import { fetchAllDivisions } from '@/lib/api/divisions';

export default function DistrictsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [divisionFilter, setDivisionFilter] = useState('all');

  const {
    data: districts,
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
    fetchFunction: fetchDistricts,
    initialParams: {},
  });

  // Load divisions for filter and form
  useEffect(() => {
    const loadDivisions = async () => {
      try {
        const divisionsData = await fetchAllDivisions();
        setDivisions(divisionsData);
      } catch (error) {
        console.error('Failed to load divisions:', error);
      }
    };

    loadDivisions();
  }, []);

  const handleAddDistrict = () => {
    setEditingDistrict(null);
    setIsFormOpen(true);
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this district?')) {
      try {
        await deleteDistrict(id);
        toast.success('District deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error('Delete failed', {
          description: error.message,
        });
      }
    }
  };

  const handleFormSuccess = async (formData: DistrictCreateInput) => {
    try {
      if (editingDistrict) {
        await updateDistrict(editingDistrict.id, formData);
        toast.success('District updated successfully');
      } else {
        await createDistrict(formData);
        toast.success('District created successfully');
      }
      
      refetch();
      setIsFormOpen(false);
      setEditingDistrict(null);
    } catch (error: any) {
      toast.error('Operation failed', {
        description: error.message,
      });
    }
  };

  const handleDivisionFilterChange = (value: string) => {
    setDivisionFilter(value);
    updateParams({ 
      division_id: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setDivisionFilter('all');
    updateParams({ 
      search: '',
      division_id: undefined
    });
  };

  const filters = [
    {
      key: 'division',
      label: 'Division',
      options: [
        { value: 'all', label: 'All Divisions' },
        ...divisions.map(division => ({
          value: division.id.toString(),
          label: division.name
        }))
      ],
      value: divisionFilter,
      onChange: handleDivisionFilterChange,
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Districts</h1>
            <p className="text-gray-600">Manage geographical districts</p>
          </div>
          <Button onClick={handleAddDistrict}>Add District</Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-red-600">
          <p>Error loading districts: {error}</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Districts</h1>
          <p className="text-gray-600">
            Manage geographical districts with search, filters, and pagination
          </p>
        </div>
        <Button onClick={handleAddDistrict}>Add District</Button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={params.search || ''}
        onSearchChange={setSearch}
        filters={filters}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search districts..."
      />

      {/* Districts Table */}
      <DistrictsTable
        districts={districts}
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

      {/* District Form */}
      <DistrictForm
        district={editingDistrict || undefined}
        divisions={divisions}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDistrict(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}