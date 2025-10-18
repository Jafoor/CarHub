// app/(dashboard)/users/page.tsx
'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/tables/users-table';
import { UserForm } from '@/components/forms/user-form';
import { SearchFilters } from '@/components/data/search-filters';
import { Pagination } from '@/components/data/pagination';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { useDataFetching } from '@/hooks/use-data-fetching';
import { fetchUsers } from '@/lib/api/users';

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Role filter state
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const {
    data: users,
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
    fetchFunction: fetchUsers,
    initialParams: {
      role: '',
      dateFilter: '',
    },
  });

  // Update params when filters change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    updateParams({ role: value });
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    updateParams({ dateFilter: value });
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setDateFilter('');
    updateParams({ 
      search: '',
      role: '',
      dateFilter: '',
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleView = (user: User) => {
    toast.info("View User", {
      description: `Viewing details for ${user.full_name}`,
    });
  };

  const handleDelete = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.error("User deleted", {
          description: "The user has been successfully deleted.",
        });
        refetch(); // Refresh the data
      } catch (error) {
        toast.error("Delete failed", {
          description: "Failed to delete user.",
        });
      }
    }
  };

  const handleFormSuccess = async (userData: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingUser) {
        toast.success("User updated", {
          description: "The user has been successfully updated.",
        });
      } else {
        toast.success("User created", {
          description: "The new user has been successfully created.",
        });
      }
      
      refetch(); // Refresh the data
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error("Operation failed", {
        description: "Failed to save user.",
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-red-600">
          <p>Error loading users: {error}</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-gray-600">
            Manage system users with search, filters, and pagination
          </p>
        </div>
        <Button onClick={handleAddUser}>Add User</Button>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchValue={params.search || ''}
        onSearchChange={setSearch}
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'user', label: 'User' },
            ],
            value: roleFilter,
            onChange: handleRoleFilterChange,
          },
          {
            key: 'date',
            label: 'Date',
            options: [
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Last 7 days' },
              { value: 'month', label: 'Last 30 days' },
              { value: 'year', label: 'Last year' },
            ],
            value: dateFilter,
            onChange: handleDateFilterChange,
          },
        ]}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search by name, email, or role..."
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* User Form */}
      <UserForm
        user={editingUser || undefined}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}