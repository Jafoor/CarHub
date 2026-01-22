"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegionsTab } from "@/components/settings/RegionsTab";
import { CitiesTab } from "@/components/settings/CitiesTab";
import { AreasTab } from "@/components/settings/AreasTab";

export default function AddressManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Address Management</h1>
          <p className="text-muted-foreground">
            Manage regions, cities, and areas in one place
          </p>
        </div>
      </div>

      <Tabs defaultValue="regions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
        </TabsList>
        <TabsContent value="regions">
          <RegionsTab />
        </TabsContent>
        <TabsContent value="cities">
          <CitiesTab />
        </TabsContent>
        <TabsContent value="areas">
          <AreasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
