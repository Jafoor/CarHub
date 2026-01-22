"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, Area, City } from "@/lib/api/settings";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const areaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  display_name: z.string().min(1, "Display Name is required"),
  city_id: z.string().min(1, "City is required"),
  is_active: z.boolean().optional(),
});

type AreaFormValues = z.infer<typeof areaSchema>;

// --- Modals ---

function AreaModal({
  isOpen,
  onClose,
  area,
  cities,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  area?: Area | null;
  cities: City[];
  onSubmit: (values: AreaFormValues) => void;
  isLoading: boolean;
}) {
  const isEditing = !!area;

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: "",
      display_name: "",
      city_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditing && area
          ? {
              name: area.name,
              display_name: area.display_name,
              city_id: area.city_id.toString(),
              is_active: area.is_active,
            }
          : {
              name: "",
              display_name: "",
              city_id: "",
              is_active: true,
            }
      );
    }
  }, [isOpen, area, isEditing, form.reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Area" : "Create New Area"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[200]">
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.display_name}
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
                      <Input placeholder="mirpur-10" {...field} value={field.value ?? ""} />
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
                      <Input placeholder="Mirpur 10" {...field} value={field.value ?? ""} />
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
                  {isEditing ? "Update Area" : "Create Area"}
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
          <CardTitle>Delete Area</CardTitle>
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

export function AreasTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const debouncedSearch = useDebounce(search, 500);

  // Queries
  const { data: citiesData } = useQuery({
    queryKey: ["cities-all"],
    queryFn: () => settingsApi.getCities({ limit: 100 }), // Fetch all cities for dropdowns
  });

  const { data, isLoading } = useQuery({
    queryKey: ["areas", page, pageSize, debouncedSearch, cityFilter],
    queryFn: () =>
      settingsApi.getAreas({
        page,
        limit: pageSize,
        search: debouncedSearch,
        city_id: cityFilter !== "all" ? parseInt(cityFilter) : undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: AreaFormValues) =>
      settingsApi.createArea({
        ...data,
        city_id: parseInt(data.city_id),
        is_active: data.is_active ?? true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      setIsCreateModalOpen(false);
      toast.success("Area created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create area");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AreaFormValues }) =>
      settingsApi.updateArea(id, {
        ...data,
        city_id: parseInt(data.city_id),
        is_active: data.is_active ?? true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      setEditingArea(null);
      toast.success("Area updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update area");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      setDeletingArea(null);
      toast.success("Area deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete area");
    },
  });

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deletingArea, setDeletingArea] = useState<Area | null>(null);

  const handleCreate = (values: AreaFormValues) => {
    createMutation.mutate({
      ...values,
      is_active: values.is_active ?? true,
    });
  };

  const handleUpdate = (values: AreaFormValues) => {
    if (editingArea) {
      updateMutation.mutate({
        id: editingArea.id,
        data: {
          ...values,
          is_active: values.is_active ?? true,
        },
      });
    }
  };

  const handleDelete = () => {
    if (deletingArea) {
      deleteMutation.mutate(deletingArea.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Area
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search areas..."
                className="pl-8 w-full lg:w-[300px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {citiesData?.data.items.map((city: City) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>City</TableHead>
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
                      No areas found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.items.map((area: Area) => (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell>{area.display_name}</TableCell>
                      <TableCell>{area.city?.display_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={area.is_active ? "default" : "destructive"}>
                          {area.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(area.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => setEditingArea(area)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeletingArea(area)}
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

      <AreaModal
        isOpen={isCreateModalOpen || !!editingArea}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingArea(null);
        }}
        area={editingArea}
        cities={citiesData?.data.items || []}
        onSubmit={editingArea ? handleUpdate : handleCreate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingArea}
        onClose={() => setDeletingArea(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        itemName={deletingArea?.display_name || ""}
      />
    </div>
  );
}
