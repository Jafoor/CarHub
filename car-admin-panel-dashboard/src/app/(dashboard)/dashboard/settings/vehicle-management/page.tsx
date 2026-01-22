"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleTypesTab } from "@/components/settings/VehicleTypesTab";
import { VehicleBrandsTab } from "@/components/settings/VehicleBrandsTab";

export default function VehicleManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">
            Manage vehicle types, brands, and configurations
          </p>
        </div>
      </div>

      <Tabs defaultValue="vehicle-types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicle-types">Vehicle Types</TabsTrigger>
          <TabsTrigger value="vehicle-brands">Vehicle Brands</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicle-types">
          <VehicleTypesTab />
        </TabsContent>
        <TabsContent value="vehicle-brands">
          <VehicleBrandsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
