"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, VehicleType } from "@/lib/api/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { PaginationControls } from "@/components/common/PaginationControls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// --- Schemas ---

const vehicleTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  display_name: z.string().min(1, "Display Name is required"),
  is_active: z.boolean().optional(),
});

type VehicleTypeFormValues = z.infer<typeof vehicleTypeSchema>;

// --- Modals ---

function VehicleTypeModal({
  isOpen,
  onClose,
  vehicleType,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicleType?: VehicleType | null;
  onSubmit: (values: VehicleTypeFormValues) => void;
  isLoading: boolean;
}) {
  const isEditing = !!vehicleType;

  const form = useForm<VehicleTypeFormValues>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: {
      name: "",
      display_name: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditing && vehicleType
          ? {
              name: vehicleType.name,
              display_name: vehicleType.display_name,
              is_active: vehicleType.is_active,
            }
          : {
              name: "",
              display_name: "",
              is_active: true,
            }
      );
    }
  }, [isOpen, vehicleType, isEditing, form.reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Vehicle Type" : "Create New Vehicle Type"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="sedan" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sedan" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Vehicle Type" : "Create Vehicle Type"}
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
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  itemName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Delete Vehicle Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Component ---

export function VehicleTypesTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["vehicleTypes", page, pageSize, debouncedSearch],
    queryFn: () =>
      settingsApi.getVehicleTypes({
        page,
        limit: pageSize,
        search: debouncedSearch,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: settingsApi.createVehicleType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
      setIsCreateModalOpen(false);
      toast.success("Vehicle type created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create vehicle type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleTypeFormValues }) =>
      settingsApi.updateVehicleType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
      setEditingVehicleType(null);
      toast.success("Vehicle type updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vehicle type");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteVehicleType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
      setDeletingVehicleType(null);
      toast.success("Vehicle type deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vehicle type");
    },
  });

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [deletingVehicleType, setDeletingVehicleType] = useState<VehicleType | null>(null);

  const handleCreate = (values: VehicleTypeFormValues) => {
    createMutation.mutate({
      ...values,
      is_active: values.is_active ?? true,
    });
  };

  const handleUpdate = (values: VehicleTypeFormValues) => {
    if (editingVehicleType) {
      updateMutation.mutate({
        id: editingVehicleType.id,
        data: {
          ...values,
          is_active: values.is_active ?? true,
        },
      });
    }
  };

  const handleDelete = () => {
    if (deletingVehicleType) {
      deleteMutation.mutate(deletingVehicleType.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle Type
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicle types..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : data?.data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No vehicle types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.items.map((vehicleType: VehicleType) => (
                    <TableRow key={vehicleType.id}>
                      <TableCell className="font-medium">{vehicleType.name}</TableCell>
                      <TableCell>{vehicleType.display_name}</TableCell>
                      <TableCell>
                        <Badge variant={vehicleType.is_active ? "default" : "destructive"}>
                          {vehicleType.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(vehicleType.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingVehicleType(vehicleType)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeletingVehicleType(vehicleType)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

          <div className="mt-4">
            <PaginationControls
              currentPage={page}
              totalItems={data?.data.total || 0}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      <VehicleTypeModal
        isOpen={isCreateModalOpen || !!editingVehicleType}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingVehicleType(null);
        }}
        vehicleType={editingVehicleType}
        onSubmit={editingVehicleType ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingVehicleType}
        onClose={() => setDeletingVehicleType(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        itemName={deletingVehicleType?.display_name || ""}
      />
    </div>
  );
}
