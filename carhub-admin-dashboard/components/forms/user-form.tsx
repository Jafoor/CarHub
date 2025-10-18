// components/forms/user-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user';
import { userFormSchema, UserFormData } from '@/lib/validation/user';

interface UserFormProps {
  user?: User;
  open: boolean;
  onClose: () => void;
  onSuccess: (user: UserFormData) => void;
}

export function UserForm({ user, open, onClose, onSuccess }: UserFormProps) {
  const isEditing = !!user;

  const form = useForm<UserFormData>({
  resolver: zodResolver(userFormSchema),
  defaultValues: {
    full_name: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  },
});


  useEffect(() => {
    if (user && open) {
      form.reset({
        full_name: user.full_name,
        email: user.email,
        role: user.role as 'admin' | 'manager' | 'user',
        password: '',
        confirmPassword: '',
      });
    } else if (!open) {
      form.reset({
        full_name: '',
        email: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, open, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      if (!userData.password) {
        delete userData.password;
      }
      
      console.log('User data:', userData);
      onSuccess(userData);
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
<FormField
  control={form.control}
  name="full_name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Full Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter full name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Field */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field - Only show for new users or when changing password */}
            {!isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {isEditing && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Leave password fields empty to keep current password.
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}