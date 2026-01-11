'use client';

import { useState, useEffect } from 'react';
import { ShowroomsTable } from '@/components/tables/showrooms-table';
import { ShowroomForm } from '@/components/forms/showroom-form';
import { SearchFilters } from '@/components/data/search-filters';
import { Pagination } from '@/components/data/pagination';
import { Button } from '@/components/ui/button';
import { Showroom, ShowroomCreateInput } from '@/types/showroom';
import { Division } from '@/types/division';
import { District } from '@/types/district';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { 
  fetchShowrooms, 
  createShowroom, 
  updateShowroom, 
  deleteShowroom,
  toggleShowroomVerification,
  updateShowroomStatus
} from '@/lib/api/showrooms';
import { fetchAllDivisions } from '@/lib/api/divisions';
import { fetchAllDistricts } from '@/lib/api/districts';
import { fetchUsers } from '@/lib/api/users';

export default function ShowroomsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const {
    data: showrooms,
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
    fetchFunction: fetchShowrooms,
    initialParams: {},
  });

  // Load divisions, districts, and users
  useEffect(() => {
    const loadData = async () => {
      try {
        const [divisionsData, districtsData, usersData] = await Promise.all([
          fetchAllDivisions(),
          fetchAllDistricts(),
          fetchUsers({ page: 1, limit: 100 }) // Adjust as needed
        ]);
        setDivisions(divisionsData);
        setDistricts(districtsData);
        setUsers(usersData.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const handleAddShowroom = () => {
    setEditingShowroom(null);
    setIsFormOpen(true);
  };

  const handleEdit = (showroom: Showroom) => {
    setEditingShowroom(showroom);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this showroom?')) {
      try {
        await deleteShowroom(id);
        toast.success('Showroom deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error('Delete failed', {
          description: error.message,
        });
      }
    }
  };

  const handleToggleVerification = async (id: number, verified: boolean) => {
    try {
      await toggleShowroomVerification(id, verified);
      toast.success(`Showroom ${verified ? 'verified' : 'unverified'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error('Operation failed', {
        description: error.message,
      });
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateShowroomStatus(id, status);
      toast.success('Showroom status updated successfully');
      refetch();
    } catch (error: any) {
      toast.error('Status update failed', {
        description: error.message,
      });
    }
  };

  const handleFormSuccess = async (formData: ShowroomCreateInput) => {
    try {
      if (editingShowroom) {
        await updateShowroom(editingShowroom.id, formData);
        toast.success('Showroom updated successfully');
      } else {
        await createShowroom(formData);
        toast.success('Showroom created successfully');
      }
      
      refetch();
      setIsFormOpen(false);
      setEditingShowroom(null);
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

  const handleDistrictFilterChange = (value: string) => {
    setDistrictFilter(value);
    updateParams({ 
      district_id: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleVerifiedFilterChange = (value: string) => {
    setVerifiedFilter(value);
    updateParams({ 
      verified_only: value === 'verified' ? true : undefined
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setDivisionFilter('all');
    setDistrictFilter('all');
    setVerifiedFilter('all');
    updateParams({ 
      search: '',
      division_id: undefined,
      district_id: undefined,
      verified_only: undefined
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
    {
      key: 'district',
      label: 'District',
      options: [
        { value: 'all', label: 'All Districts' },
        ...districts.map(district => ({
          value: district.id.toString(),
          label: district.name
        }))
      ],
      value: districtFilter,
      onChange: handleDistrictFilterChange,
    },
    {
      key: 'verified',
      label: 'Verification',
      options: [
        { value: 'all', label: 'All' },
        { value: 'verified', label: 'Verified Only' },
        { value: 'unverified', label: 'Unverified Only' },
      ],
      value: verifiedFilter,
      onChange: handleVerifiedFilterChange,
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Showrooms</h1>
            <p className="text-gray-600">Manage car showrooms</p>
          </div>
          <Button onClick={handleAddShowroom}>Add Showroom</Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-red-600">
          <p>Error loading showrooms: {error}</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Showrooms</h1>
          <p className="text-gray-600">
            Manage car showrooms with search, filters, and pagination
          </p>
        </div>
        <Button onClick={handleAddShowroom}>Add Showroom</Button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={params.search || ''}
        onSearchChange={setSearch}
        filters={filters}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search showrooms..."
      />

      {/* Showrooms Table */}
      <ShowroomsTable
        showrooms={showrooms}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleVerification={handleToggleVerification}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Showroom Form */}
      <ShowroomForm
        showroom={editingShowroom || undefined}
        divisions={divisions}
        districts={districts}
        users={users}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingShowroom(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}