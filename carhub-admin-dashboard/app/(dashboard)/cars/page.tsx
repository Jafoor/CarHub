'use client';

import { useState, useEffect } from 'react';
import { CarsTable } from '@/components/tables/cars-table';
import { CarForm } from '@/components/forms/car-form';
import { SearchFilters } from '@/components/data/search-filters';
import { Pagination } from '@/components/data/pagination';
import { Button } from '@/components/ui/button';
import { Car, CarCreateInput } from '@/types/car';
import { Brand } from '@/types/brand';
import { VehicleType } from '@/types/vehicle-type';
import { Division } from '@/types/division';
import { District } from '@/types/district';
import { User } from '@/types/user';
import { Showroom } from '@/types/showroom';
import { toast } from 'sonner';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { 
  fetchCars, 
  createCar, 
  updateCar, 
  deleteCar,
  updateCarStatus,
  toggleCarFeatured,
  toggleCarVerified
} from '@/lib/api/cars';
import { fetchAllBrands } from '@/lib/api/brands';
import { fetchAllVehicleTypes } from '@/lib/api/vehicle-types';
import { fetchAllDivisions } from '@/lib/api/divisions';
import { fetchAllDistricts } from '@/lib/api/districts';
import { fetchUsers } from '@/lib/api/users';
import { fetchAllShowrooms } from '@/lib/api/showrooms';

export default function CarsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  
  // Filter states
  const [brandFilter, setBrandFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const {
    data: cars,
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
    fetchFunction: fetchCars,
    initialParams: { limit: 12 },
  });

  // Load all necessary data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          brandsData, 
          vehicleTypesData, 
          divisionsData, 
          districtsData, 
          usersData,
          showroomsData
        ] = await Promise.all([
          fetchAllBrands(),
          fetchAllVehicleTypes(),
          fetchAllDivisions(),
          fetchAllDistricts(),
          fetchUsers({ page: 1, limit: 1000 }),
          fetchAllShowrooms()
        ]);
        
        setBrands(brandsData);
        setVehicleTypes(vehicleTypesData);
        setDivisions(divisionsData);
        setDistricts(districtsData);
        setUsers(usersData.data);
        setShowrooms(showroomsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load required data');
      }
    };

    loadData();
  }, []);

  const handleAddCar = () => {
    setEditingCar(null);
    setIsFormOpen(true);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(id);
        toast.success('Car deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error('Delete failed', {
          description: error.message,
        });
      }
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateCarStatus(id, status);
      toast.success('Car status updated successfully');
      refetch();
    } catch (error: any) {
      toast.error('Status update failed', {
        description: error.message,
      });
    }
  };

  const handleToggleFeatured = async (id: number, featured: boolean) => {
    try {
      await toggleCarFeatured(id, featured);
      toast.success(`Car ${featured ? 'featured' : 'unfeatured'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error('Operation failed', {
        description: error.message,
      });
    }
  };

  const handleToggleVerified = async (id: number, verified: boolean) => {
    try {
      await toggleCarVerified(id, verified);
      toast.success(`Car ${verified ? 'verified' : 'unverified'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error('Operation failed', {
        description: error.message,
      });
    }
  };

  const handleFormSuccess = async (formData: CarCreateInput) => {
    try {
      if (editingCar) {
        await updateCar(editingCar.id, formData);
        toast.success('Car updated successfully');
      } else {
        await createCar(formData);
        toast.success('Car created successfully');
      }
      
      refetch();
      setIsFormOpen(false);
      setEditingCar(null);
    } catch (error: any) {
      toast.error('Operation failed', {
        description: error.message,
      });
    }
  };

  // Filter handlers
  const handleBrandFilterChange = (value: string) => {
    setBrandFilter(value);
    updateParams({ 
      brand_id: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleVehicleTypeFilterChange = (value: string) => {
    setVehicleTypeFilter(value);
    updateParams({ 
      vehicle_type_id: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleConditionFilterChange = (value: string) => {
    setConditionFilter(value);
    updateParams({ 
      condition: value === 'all' ? undefined : value
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    updateParams({ 
      status: value === 'all' ? undefined : value
    });
  };

  const handleTransmissionFilterChange = (value: string) => {
    setTransmissionFilter(value);
    updateParams({ 
      transmission: value === 'all' ? undefined : value
    });
  };

  const handleFuelTypeFilterChange = (value: string) => {
    setFuelTypeFilter(value);
    updateParams({ 
      fuel_type: value === 'all' ? undefined : value
    });
  };

  const handleDivisionFilterChange = (value: string) => {
    setDivisionFilter(value);
    updateParams({ 
      division_id: value === 'all' ? undefined : parseInt(value)
    });
  };

  const handleFeaturedFilterChange = (value: string) => {
    setFeaturedFilter(value);
    updateParams({ 
      is_featured: value === 'all' ? undefined : value === 'featured'
    });
  };

  const handleVerifiedFilterChange = (value: string) => {
    setVerifiedFilter(value);
    updateParams({ 
      is_verified: value === 'all' ? undefined : value === 'verified'
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setBrandFilter('all');
    setVehicleTypeFilter('all');
    setConditionFilter('all');
    setStatusFilter('all');
    setTransmissionFilter('all');
    setFuelTypeFilter('all');
    setDivisionFilter('all');
    setFeaturedFilter('all');
    setVerifiedFilter('all');
    
    updateParams({ 
      search: '',
      brand_id: undefined,
      vehicle_type_id: undefined,
      condition: undefined,
      status: undefined,
      transmission: undefined,
      fuel_type: undefined,
      division_id: undefined,
      is_featured: undefined,
      is_verified: undefined
    });
  };

  const filters = [
    {
      key: 'brand',
      label: 'Brand',
      options: [
        { value: 'all', label: 'All Brands' },
        ...brands.map(brand => ({
          value: brand.id.toString(),
          label: brand.name
        }))
      ],
      value: brandFilter,
      onChange: handleBrandFilterChange,
    },
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
    {
      key: 'condition',
      label: 'Condition',
      options: [
        { value: 'all', label: 'All Conditions' },
        { value: 'brand_new', label: 'Brand New' },
        { value: 'used', label: 'Used' },
        { value: 'refurbished', label: 'Refurbished' },
        { value: 'reconditioned', label: 'Reconditioned' },
      ],
      value: conditionFilter,
      onChange: handleConditionFilterChange,
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'sold', label: 'Sold' },
        { value: 'reserved', label: 'Reserved' },
        { value: 'expired', label: 'Expired' },
      ],
      value: statusFilter,
      onChange: handleStatusFilterChange,
    },
    {
      key: 'transmission',
      label: 'Transmission',
      options: [
        { value: 'all', label: 'All Transmission' },
        { value: 'manual', label: 'Manual' },
        { value: 'automatic', label: 'Automatic' },
        { value: 'semi_automatic', label: 'Semi-Automatic' },
        { value: 'cvt', label: 'CVT' },
      ],
      value: transmissionFilter,
      onChange: handleTransmissionFilterChange,
    },
    {
      key: 'fuel_type',
      label: 'Fuel Type',
      options: [
        { value: 'all', label: 'All Fuel Types' },
        { value: 'petrol', label: 'Petrol' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'electric', label: 'Electric' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'cng', label: 'CNG' },
        { value: 'lpg', label: 'LPG' },
      ],
      value: fuelTypeFilter,
      onChange: handleFuelTypeFilterChange,
    },
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
      key: 'featured',
      label: 'Featured',
      options: [
        { value: 'all', label: 'All' },
        { value: 'featured', label: 'Featured Only' },
        { value: 'not_featured', label: 'Not Featured' },
      ],
      value: featuredFilter,
      onChange: handleFeaturedFilterChange,
    },
    {
      key: 'verified',
      label: 'Verified',
      options: [
        { value: 'all', label: 'All' },
        { value: 'verified', label: 'Verified Only' },
        { value: 'not_verified', label: 'Not Verified' },
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
            <h1 className="text-3xl font-bold tracking-tight">Cars</h1>
            <p className="text-gray-600">Manage car listings</p>
          </div>
          <Button onClick={handleAddCar}>Add Car</Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-red-600">
          <p>Error loading cars: {error}</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cars</h1>
          <p className="text-gray-600">
            Manage car listings with comprehensive filters and search
          </p>
        </div>
        <Button onClick={handleAddCar}>Add Car</Button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={params.search || ''}
        onSearchChange={setSearch}
        filters={filters}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search cars by title, description, or model..."
      />

      {/* Cars Table */}
      <CarsTable
        cars={cars}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
        onToggleFeatured={handleToggleFeatured}
        onToggleVerified={handleToggleVerified}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Car Form */}
      <CarForm
        car={editingCar || undefined}
        brands={brands}
        vehicleTypes={vehicleTypes}
        divisions={divisions}
        districts={districts}
        users={users}
        showrooms={showrooms}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCar(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}