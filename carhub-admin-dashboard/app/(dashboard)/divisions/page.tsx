'use client';

import { useState } from 'react';
import { DivisionsTable } from '@/components/tables/divisions-table';
import { DivisionForm } from '@/components/forms/division-form';
import { SearchFilters } from '@/components/data/search-filters';
import { Pagination } from '@/components/data/pagination';
import { Button } from '@/components/ui/button';
import { Division, DivisionCreateInput } from '@/types/division';
import { toast } from 'sonner';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { fetchDivisions, createDivision, updateDivision, deleteDivision } from '@/lib/api/divisions';

export default function DivisionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  const {
    data: divisions,
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
    fetchFunction: fetchDivisions,
    initialParams: {},
  });

  const handleAddDivision = () => {
    setEditingDivision(null);
    setIsFormOpen(true);
  };

  const handleEdit = (division: Division) => {
    setEditingDivision(division);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this division?')) {
      try {
        await deleteDivision(id);
        toast.success('Division deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error('Delete failed', {
          description: error.message,
        });
      }
    }
  };

  const handleFormSuccess = async (formData: DivisionCreateInput) => {
    try {
      if (editingDivision) {
        await updateDivision(editingDivision.id, formData);
        toast.success('Division updated successfully');
      } else {
        await createDivision(formData);
        toast.success('Division created successfully');
      }
      
      refetch();
      setIsFormOpen(false);
      setEditingDivision(null);
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
            <h1 className="text-3xl font-bold tracking-tight">Divisions</h1>
            <p className="text-gray-600">Manage geographical divisions</p>
          </div>
          <Button onClick={handleAddDivision}>Add Division</Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-red-600">
          <p>Error loading divisions: {error}</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Divisions</h1>
          <p className="text-gray-600">
            Manage geographical divisions with search and pagination
          </p>
        </div>
        <Button onClick={handleAddDivision}>Add Division</Button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={params.search || ''}
        onSearchChange={setSearch}
        filters={[]}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search divisions..."
      />

      {/* Divisions Table */}
      <DivisionsTable
        divisions={divisions}
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

      {/* Division Form */}
      <DivisionForm
        division={editingDivision || undefined}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDivision(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}