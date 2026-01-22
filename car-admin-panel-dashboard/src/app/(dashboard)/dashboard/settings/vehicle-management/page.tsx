"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleTypesTab } from "@/components/settings/VehicleTypesTab";

export default function VehicleManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Management</h1>
          <p className="text-muted-foreground">
            Manage vehicle types and configurations
          </p>
        </div>
      </div>

      <Tabs defaultValue="vehicle-types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicle-types">Vehicle Types</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicle-types">
          <VehicleTypesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
