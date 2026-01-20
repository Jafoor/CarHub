/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   rolesApi,
//   Role,
//   CreateRolePayload,
//   UpdateRolePayload,
// } from "@/lib/api/roles";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   X,
//   Loader2,
//   Check,
//   AlertTriangle,
// } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { usePermissions } from "@/hooks/use-permissions";
// import { roleAccess } from "@/lib/constants/roleAccess";
// import { toast } from "sonner";

// // Schema
// const roleSchema = z.object({
//   name: z
//     .string()
//     .min(1, "Name (slug) is required")
//     .regex(
//       /^[a-z0-9_]+$/,
//       "Name must be lowercase alphanumeric with underscores",
//     ),
//   display_name: z.string().min(1, "Display Name is required"),
//   description: z.string().optional(),
//   is_default: z.boolean().default(false),
//   is_super_admin: z.boolean().default(false),
// });

// type RoleFormValues = z.infer<typeof roleSchema>;

// function RoleModal({
//   isOpen,
//   onClose,
//   role,
//   onSubmit,
//   isLoading,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   role?: Role | null;
//   onSubmit: (values: RoleFormValues) => void;
//   isLoading: boolean;
// }) {
//   const form = useForm<RoleFormValues>({
//     resolver: zodResolver(roleSchema),
//     defaultValues: {
//       name: role?.name || "",
//       display_name: role?.display_name || "",
//       description: role?.description || "",
//       is_default: role?.is_default || false,
//       is_super_admin: role?.is_super_admin || false,
//     },
//   });

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>{role ? "Edit Role" : "Create Role"}</CardTitle>
//           <Button variant="ghost" size="icon" onClick={onClose} type="button">
//             <X className="h-4 w-4" />
//           </Button>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Name (Slug)</FormLabel>
//                     <FormControl>
//                       <Input placeholder="admin_manager" {...field} />
//                     </FormControl>
//                     <FormDescription>
//                       Unique identifier, lowercase with underscores.
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="display_name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Display Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Admin Manager" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Role description" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="flex gap-4">
//                 <FormField
//                   control={form.control}
//                   name="is_default"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                       <FormControl>
//                         <input
//                           type="checkbox"
//                           checked={field.value}
//                           onChange={field.onChange}
//                           className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
//                         />
//                       </FormControl>
//                       <div className="space-y-1 leading-none">
//                         <FormLabel>Default Role</FormLabel>
//                       </div>
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="is_super_admin"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                       <FormControl>
//                         <input
//                           type="checkbox"
//                           checked={field.value}
//                           onChange={field.onChange}
//                           className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
//                         />
//                       </FormControl>
//                       <div className="space-y-1 leading-none">
//                         <FormLabel>Super Admin</FormLabel>
//                       </div>
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="flex justify-end gap-2 pt-4">
//                 <Button type="button" variant="outline" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading && (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   )}
//                   {role ? "Update" : "Create"}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function DeleteConfirmationModal({
//   isOpen,
//   onClose,
//   onConfirm,
//   isLoading,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   isLoading: boolean;
// }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <Card className="w-full max-w-sm shadow-xl border-destructive/20">
//         <CardHeader className="pb-4">
//           <div className="flex items-center gap-2 text-destructive mb-2">
//             <AlertTriangle className="h-5 w-5" />
//             <CardTitle className="text-lg">Delete Role</CardTitle>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             Are you sure you want to delete this role? This action cannot be
//             undone.
//           </p>
//         </CardHeader>
//         <CardContent>
//           <div className="flex justify-end gap-2">
//             <Button variant="outline" onClick={onClose} disabled={isLoading}>
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={onConfirm}
//               disabled={isLoading}
//             >
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Delete
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default function RolesPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [editingRole, setEditingRole] = useState<Role | null>(null);
//   const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

//   const queryClient = useQueryClient();
//   const { canAccess } = usePermissions();

//   const { data: roles, isLoading } = useQuery({
//     queryKey: ["roles"],
//     queryFn: rolesApi.getAll,
//   });

//   const createMutation = useMutation({
//     mutationFn: rolesApi.create,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["roles"] });
//       setIsModalOpen(false);
//       toast.success("Role created successfully");
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || "Failed to create role");
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }: { id: number; data: UpdateRolePayload }) =>
//       rolesApi.update(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["roles"] });
//       setIsModalOpen(false);
//       setEditingRole(null);
//       toast.success("Role updated successfully");
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || "Failed to update role");
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: rolesApi.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["roles"] });
//       setIsDeleteModalOpen(false);
//       setDeletingRoleId(null);
//       toast.success("Role deleted successfully");
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || "Failed to delete role");
//     },
//   });

//   const handleCreate = () => {
//     setEditingRole(null);
//     setIsModalOpen(true);
//   };

//   const handleEdit = (role: Role) => {
//     setEditingRole(role);
//     setIsModalOpen(true);
//   };

//   const handleDeleteClick = (id: number) => {
//     setDeletingRoleId(id);
//     setIsDeleteModalOpen(true);
//   };

//   const confirmDelete = () => {
//     if (deletingRoleId) {
//       deleteMutation.mutate(deletingRoleId);
//     }
//   };

//   const handleSubmit = (values: RoleFormValues) => {
//     const payload: CreateRolePayload = {
//       name: values.name,
//       display_name: values.display_name,
//       description: values.description,
//       is_default: values.is_default,
//       is_super_admin: values.is_super_admin,
//     };

//     if (editingRole) {
//       updateMutation.mutate({ id: editingRole.id, data: payload });
//     } else {
//       createMutation.mutate(payload);
//     }
//   };

//   // Access check
//   if (!canAccess(roleAccess.ROLES_PAGE)) {
//     return (
//       <div className="flex h-full items-center justify-center">
//         <p className="text-muted-foreground">
//           You do not have permission to view this page.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Roles & Permissions</h1>
//         <Button onClick={handleCreate}>
//           <Plus className="mr-2 h-4 w-4" />
//           Add Role
//         </Button>
//       </div>

//       {isLoading ? (
//         <div className="flex items-center justify-center py-8">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           <div className="rounded-md border">
//             <div className="relative w-full overflow-auto">
//               <table className="w-full caption-bottom text-sm">
//                 <thead className="[&_tr]:border-b">
//                   <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
//                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
//                       Name
//                     </th>
//                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
//                       Display Name
//                     </th>
//                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
//                       Description
//                     </th>
//                     <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
//                       Attributes
//                     </th>
//                     <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="[&_tr:last-child]:border-0">
//                   {roles?.map((role) => (
//                     <tr
//                       key={role.id}
//                       className="border-b transition-colors hover:bg-muted/50"
//                     >
//                       <td className="p-4 align-middle font-medium">
//                         {role.name}
//                       </td>
//                       <td className="p-4 align-middle">{role.display_name}</td>
//                       <td className="p-4 align-middle text-muted-foreground">
//                         {role.description || "-"}
//                       </td>
//                       <td className="p-4 align-middle">
//                         <div className="flex gap-2">
//                           {role.is_default && (
//                             <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
//                               Default
//                             </span>
//                           )}
//                           {role.is_super_admin && (
//                             <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">
//                               Super Admin
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="p-4 align-middle text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => handleEdit(role)}
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => handleDeleteClick(role.id)}
//                           >
//                             <Trash2 className="h-4 w-4 text-destructive" />
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                   {(!roles || roles.length === 0) && (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="p-4 text-center text-muted-foreground"
//                       >
//                         No roles found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {isModalOpen && (
//         <RoleModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           role={editingRole}
//           onSubmit={handleSubmit}
//           isLoading={createMutation.isPending || updateMutation.isPending}
//         />
//       )}

//       {isDeleteModalOpen && (
//         <DeleteConfirmationModal
//           isOpen={isDeleteModalOpen}
//           onClose={() => setIsDeleteModalOpen(false)}
//           onConfirm={confirmDelete}
//           isLoading={deleteMutation.isPending}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rolesApi,
  Role,
  CreateRolePayload,
  UpdateRolePayload,
} from "@/lib/api/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
  AlertTriangle,
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/use-permissions";
import { roleAccess } from "@/lib/constants/roleAccess";
import { toast } from "sonner";

// Schema - note: removed .default() since we handle defaults in useForm
const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Name (slug) is required")
    .regex(
      /^[a-z0-9_]+$/,
      "Name must be lowercase alphanumeric with underscores",
    ),
  display_name: z.string().min(1, "Display Name is required"),
  description: z.string().optional(),
  is_default: z.boolean(),
  is_super_admin: z.boolean(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

function RoleModal({
  isOpen,
  onClose,
  role,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  onSubmit: (values: RoleFormValues) => void;
  isLoading: boolean;
}) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
      display_name: role?.display_name || "",
      description: role?.description || undefined,
      is_default: role?.is_default ?? false,
      is_super_admin: role?.is_super_admin ?? false,
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{role ? "Edit Role" : "Create Role"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* ✅ Explicitly typed Form component */}
          <Form<RoleFormValues> {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="showroom_manager" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier, lowercase with underscores.
                    </FormDescription>
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
                      <Input placeholder="Showroom Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Handles showroom operations and staff"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Default Role</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_super_admin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Super Admin</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {role ? "Update" : "Create"}
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
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-xl border-destructive/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-lg">Delete Role</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this role? This action cannot be
            undone.
          </p>
        </CardHeader>
        <CardContent>
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

export default function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { canAccess } = usePermissions();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsModalOpen(false);
      toast.success("Role created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRolePayload }) =>
      rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsModalOpen(false);
      setEditingRole(null);
      toast.success("Role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rolesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsDeleteModalOpen(false);
      setDeletingRoleId(null);
      toast.success("Role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete role");
    },
  });

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingRoleId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingRoleId) {
      deleteMutation.mutate(deletingRoleId);
    }
  };

  const handleSubmit = (values: RoleFormValues) => {
    const payload: CreateRolePayload = {
      name: values.name,
      display_name: values.display_name,
      description: values.description,
      is_default: values.is_default,
      is_super_admin: values.is_super_admin,
    };

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Access check
  if (!canAccess(roleAccess.ROLES_PAGE)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Display Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Attributes
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {roles?.map((role) => (
                    <tr
                      key={role.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">
                        {role.name}
                      </td>
                      <td className="p-4 align-middle">{role.display_name}</td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {role.description || "-"}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex gap-2">
                          {role.is_default && (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                              Default
                            </span>
                          )}
                          {role.is_super_admin && (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">
                              Super Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(role.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!roles || roles.length === 0) && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-muted-foreground"
                      >
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          role={editingRole}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
