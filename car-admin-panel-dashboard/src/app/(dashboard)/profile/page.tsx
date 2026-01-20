"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input/input";

const allCountries = getCountries();

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_country: z.string().min(1, "Country code is required"),
  phone_number: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(6, "Current password is required"),
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_country: "BD",
      phone_number: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: authApi.getProfile,
  });

  useEffect(() => {
    if (profile) {
      const fullPhone = profile.phone ?? "";

      let phoneCountry = "BD";
      let phoneNumber = "";

      if (fullPhone.startsWith("+")) {
        const digits = fullPhone.slice(1);
        let matchedCountry = "";
        let matchedCodeLength = 0;

        for (const country of allCountries) {
          const code = getCountryCallingCode(country);
          if (digits.startsWith(code) && code.length > matchedCodeLength) {
            matchedCountry = country;
            matchedCodeLength = code.length;
          }
        }

        if (matchedCountry) {
          phoneCountry = matchedCountry;
          phoneNumber = digits.slice(matchedCodeLength);
        } else {
          phoneCountry = "BD";
          phoneNumber = digits;
        }
      } else if (fullPhone) {
        phoneCountry = "BD";
        phoneNumber = fullPhone;
      }

      profileForm.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_country: phoneCountry,
        phone_number: phoneNumber,
      });

      setUser({
        id: String(profile.id),
        email: profile.email,
        name: `${profile.first_name} ${profile.last_name}`,
        role: user?.role ?? "staff",
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        emailVerified: profile.email_verified,
        isActive: profile.is_active,
      });
    }
  }, [profile, profileForm, setUser, user?.role]);

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile"], updated);
      setUser({
        id: String(updated.id),
        email: updated.email,
        name: `${updated.first_name} ${updated.last_name}`,
        role: user?.role ?? "staff",
        firstName: updated.first_name,
        lastName: updated.last_name,
        phone: updated.phone,
        emailVerified: updated.email_verified,
        isActive: updated.is_active,
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      authApi.updatePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      }),
    onSuccess: () => {
      passwordForm.reset();
    },
  });

  const onSubmitProfile = (values: ProfileFormValues) => {
    const rawNumber = values.phone_number?.replace(/\s+/g, "") ?? "";
    let phone = "";

    if (rawNumber) {
      const callingCode = getCountryCallingCode(
        values.phone_country as unknown as never,
      );
      phone = `+${callingCode}${rawNumber}`;
    }

    updateProfileMutation.mutate({
      first_name: values.first_name,
      last_name: values.last_name,
      phone,
    });
  };

  const onSubmitPassword = (values: PasswordFormValues) => {
    updatePasswordMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                className="space-y-4"
              >
                <FormField
                  control={profileForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {allCountries.map((country) => {
                                const code = getCountryCallingCode(country);
                                return (
                                  <SelectItem key={country} value={country}>
                                    <span className="mr-2">
                                      {getFlagEmoji(country)}
                                    </span>
                                    <span className="mr-2">+{code}</span>
                                    <span>{country}</span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormField
                            control={profileForm.control}
                            name="phone_number"
                            render={({ field: numberField }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="Phone number"
                                    {...numberField}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProfileLoading || updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? "Updating..."
                    : "Update Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="New password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirm_password"
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
