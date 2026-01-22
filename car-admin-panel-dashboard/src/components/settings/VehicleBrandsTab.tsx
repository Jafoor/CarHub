"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, VehicleBrand, VehicleType } from "@/lib/api/settings";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const vehicleBrandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  display_name: z.string().min(1, "Display Name is required"),
  vehicle_type_id: z.coerce.number().min(1, "Vehicle Type is required"),
  is_active: z.boolean().optional(),
});

type VehicleBrandFormValues = z.infer<typeof vehicleBrandSchema>;

// --- Modals ---

function VehicleBrandModal({
  isOpen,
  onClose,
  vehicleBrand,
  onSubmit,
  isLoading,
  vehicleTypes,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicleBrand?: VehicleBrand | null;
  onSubmit: (values: VehicleBrandFormValues) => void;
  isLoading: boolean;
  vehicleTypes: VehicleType[];
}) {
  const isEditing = !!vehicleBrand;

  const form = useForm<VehicleBrandFormValues>({
    resolver: zodResolver(vehicleBrandSchema) as any,
    defaultValues: {
      name: "",
      display_name: "",
      vehicle_type_id: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditing && vehicleBrand
          ? {
              name: vehicleBrand.name,
              display_name: vehicleBrand.display_name,
              vehicle_type_id: vehicleBrand.vehicle_type_id,
              is_active: vehicleBrand.is_active,
            }
          : {
              name: "",
              display_name: "",
              vehicle_type_id: 0,
              is_active: true,
            }
      );
    }
  }, [isOpen, vehicleBrand, isEditing, form.reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Vehicle Brand" : "Create New Vehicle Brand"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="vehicle_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ? field.value.toString() : undefined}
                      disabled={false} // Allow editing of vehicle type
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[200]">
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="toyota" {...field} value={field.value ?? ""} />
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
                      <Input placeholder="Toyota" {...field} value={field.value ?? ""} />
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
                  {isEditing ? "Update Vehicle Brand" : "Create Vehicle Brand"}
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
          <CardTitle>Delete Vehicle Brand</CardTitle>
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

export function VehicleBrandsTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");

  const debouncedSearch = useDebounce(search, 500);

  // Queries
  const { data: vehicleTypesData } = useQuery({
    queryKey: ["vehicleTypes", "all"],
    queryFn: () => settingsApi.getVehicleTypes({ limit: 100 }), // Fetch enough for dropdown
  });

  const { data, isLoading } = useQuery({
    queryKey: ["vehicleBrands", page, pageSize, debouncedSearch, selectedVehicleType],
    queryFn: () =>
      settingsApi.getVehicleBrands({
        page,
        limit: pageSize,
        search: debouncedSearch,
        vehicle_type_id: selectedVehicleType !== "all" ? Number(selectedVehicleType) : undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: settingsApi.createVehicleBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleBrands"] });
      setIsCreateModalOpen(false);
      toast.success("Vehicle brand created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create vehicle brand");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleBrandFormValues }) =>
      settingsApi.updateVehicleBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleBrands"] });
      setEditingVehicleBrand(null);
      toast.success("Vehicle brand updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vehicle brand");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteVehicleBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleBrands"] });
      setDeletingVehicleBrand(null);
      toast.success("Vehicle brand deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vehicle brand");
    },
  });

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVehicleBrand, setEditingVehicleBrand] = useState<VehicleBrand | null>(null);
  const [deletingVehicleBrand, setDeletingVehicleBrand] = useState<VehicleBrand | null>(null);

  const handleCreate = (values: VehicleBrandFormValues) => {
    createMutation.mutate({
      ...values,
      is_active: values.is_active ?? true,
    });
  };

  const handleUpdate = (values: VehicleBrandFormValues) => {
    if (editingVehicleBrand) {
      updateMutation.mutate({
        id: editingVehicleBrand.id,
        data: {
          ...values,
          is_active: values.is_active ?? true,
        },
      });
    }
  };

  const handleDelete = () => {
    if (deletingVehicleBrand) {
      deleteMutation.mutate(deletingVehicleBrand.id);
    }
  };

  const vehicleTypes = vehicleTypesData?.data.items || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle Brand
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicle brands..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicle Types</SelectItem>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : data?.data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No vehicle brands found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.items.map((vehicleBrand: VehicleBrand) => (
                    <TableRow key={vehicleBrand.id}>
                      <TableCell className="font-medium">{vehicleBrand.name}</TableCell>
                      <TableCell>{vehicleBrand.display_name}</TableCell>
                      <TableCell>{vehicleBrand.vehicle_type?.display_name}</TableCell>
                      <TableCell>
                        <Badge variant={vehicleBrand.is_active ? "default" : "destructive"}>
                          {vehicleBrand.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(vehicleBrand.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => setEditingVehicleBrand(vehicleBrand)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeletingVehicleBrand(vehicleBrand)}
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

      <VehicleBrandModal
        isOpen={isCreateModalOpen || !!editingVehicleBrand}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingVehicleBrand(null);
        }}
        vehicleBrand={editingVehicleBrand}
        onSubmit={editingVehicleBrand ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
        vehicleTypes={vehicleTypes}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingVehicleBrand}
        onClose={() => setDeletingVehicleBrand(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        itemName={deletingVehicleBrand?.display_name || ""}
      />
    </div>
  );
}
