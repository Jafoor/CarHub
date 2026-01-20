"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminsApi,
  AdminUser,
  CreateAdminPayload,
  UpdateAdminPayload,
} from "@/lib/api/admins";
import { rolesApi, Role } from "@/lib/api/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this exists or I'll implement a simple one
import { PaginationControls } from "@/components/common/PaginationControls";

// --- Schemas ---

const createAdminSchema = z.object({
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role_ids: z.array(z.string()).min(1, "At least one role is required"),
});

const updateAdminSchema = z.object({
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
  role_ids: z.array(z.string()).min(1, "At least one role is required"),
});

type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
type UpdateAdminFormValues = z.infer<typeof updateAdminSchema>;

// --- Modals ---

function AdminModal({
  isOpen,
  onClose,
  admin,
  roles,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  admin?: AdminUser | null;
  roles: Role[];
  onSubmit: (values: CreateAdminFormValues | UpdateAdminFormValues) => void;
  isLoading: boolean;
}) {
  const isEditing = !!admin;

  const form = useForm<CreateAdminFormValues | UpdateAdminFormValues>({
    resolver: zodResolver(isEditing ? updateAdminSchema : createAdminSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      role_ids: [],
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditing && admin
          ? {
              first_name: admin.first_name,
              last_name: admin.last_name,
              phone: admin.phone || "",
              is_active: admin.is_active,
              role_ids: admin.roles?.map((r) => r.id.toString()) || [],
            }
          : {
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
              password: "",
              role_ids: [],
            },
      );
    }
  }, [isOpen, admin, isEditing, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Admin" : "Create New Admin"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          value={(field.value as string) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          value={(field.value as string) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isEditing && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            value={(field.value as string) ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="******"
                            {...field}
                            value={(field.value as string) ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        {...field}
                        value={(field.value as string) ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_ids"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Roles</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((role) => (
                        <FormField
                          key={role.id}
                          control={form.control}
                          name="role_ids"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={role.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={
                                      field.value?.includes(
                                        role.id.toString(),
                                      ) ?? false
                                    }
                                    onChange={(checked) => {
                                      return checked.target.checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            role.id.toString(),
                                          ])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (value) =>
                                                value !== role.id.toString(),
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {role.display_name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update Admin" : "Create Admin"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  adminName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  adminName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Delete Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Are you sure you want to delete admin <strong>{adminName}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page ---

export default function AdminsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const debouncedSearch = useDebounce(search, 500);
  const debouncedEmailFilter = useDebounce(emailFilter, 500);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Queries
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.getAll,
  });

  const { data: adminsData, isLoading } = useQuery({
    queryKey: [
      "admins",
      page,
      pageSize,
      debouncedSearch,
      debouncedEmailFilter,
      statusFilter,
      roleFilter,
    ],
    queryFn: () =>
      adminsApi.getAll({
        page,
        limit: pageSize,
        search: debouncedSearch,
        email: debouncedEmailFilter,
        is_active:
          statusFilter === "all" ? undefined : statusFilter === "active",
        role_id: roleFilter === "all" ? undefined : parseInt(roleFilter),
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateAdminPayload) => adminsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsModalOpen(false);
      toast.success("Admin created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create admin");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAdminPayload }) =>
      adminsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsModalOpen(false);
      setSelectedAdmin(null);
      toast.success("Admin updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update admin");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
      toast.success("Admin deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete admin");
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleEdit = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (
    values: CreateAdminFormValues | UpdateAdminFormValues,
  ) => {
    if (selectedAdmin) {
      const updateValues = values as UpdateAdminFormValues;
      updateMutation.mutate({
        id: selectedAdmin.id,
        data: {
          ...updateValues,
          role_ids: updateValues.role_ids.map((id) => parseInt(id)),
        },
      });
    } else {
      const createValues = values as CreateAdminFormValues;
      createMutation.mutate({
        ...createValues,
        role_ids: createValues.role_ids.map((id) => parseInt(id)),
      });
    }
  };

  const roles = Array.isArray(rolesData) ? rolesData : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
          <p className="text-muted-foreground">
            Manage admin users and their roles.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Admin Users</CardTitle>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8 w-full lg:w-[200px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by email"
                  className="pl-8 w-full lg:w-[200px]"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : adminsData?.data?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No admins found.
                      </td>
                    </tr>
                  ) : (
                    adminsData?.data?.map((admin: AdminUser) => (
                      <tr
                        key={admin.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">
                          {admin.first_name} {admin.last_name}
                        </td>
                        <td className="p-4 align-middle">{admin.email}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1">
                            {admin.roles && admin.roles.length > 0 ? (
                              admin.roles.map((role) => (
                                <span
                                  key={role.id}
                                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-100"
                                >
                                  {role.display_name}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                N/A
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              admin.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {admin.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(admin)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteClick(admin)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {adminsData?.meta && adminsData.meta.total > 0 && (
            <PaginationControls
              currentPage={page}
              totalItems={adminsData.meta.total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1); // Reset to first page when page size changes
              }}
            />
          )}
        </CardContent>
      </Card>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        admin={selectedAdmin}
        roles={roles}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() =>
          adminToDelete && deleteMutation.mutate(adminToDelete.id)
        }
        isLoading={deleteMutation.isPending}
        adminName={
          adminToDelete
            ? `${adminToDelete.first_name} ${adminToDelete.last_name}`
            : ""
        }
      />
    </div>
  );
}
