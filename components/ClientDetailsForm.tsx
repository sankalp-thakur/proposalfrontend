"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OptimizationFormValues } from "@/app/utils/form";

interface ClientDetailsFormProps {
  form: UseFormReturn<OptimizationFormValues>;
  onNext: () => void;
}

export default function ClientDetailsForm({ form, onNext }: ClientDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client & Location Details</CardTitle>
        <CardDescription>Enter client information and location coordinates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Client Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input 
                  id="clientName" 
                  placeholder="Enter client name" 
                  {...form.register("clientName")} 
                />
                {form.formState.errors.clientName && (
                  <p className="text-sm text-red-500">{form.formState.errors.clientName.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  placeholder="e.g. 28.6139" 
                  {...form.register("latitude")} 
                />
                {form.formState.errors.latitude && (
                  <p className="text-sm text-red-500">{form.formState.errors.latitude.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  placeholder="e.g. 77.2090" 
                  {...form.register("longitude")} 
                />
                {form.formState.errors.longitude && (
                  <p className="text-sm text-red-500">{form.formState.errors.longitude.message}</p>
                )}
              </div>
            </div>
          </div>

          <Button 
            onClick={onNext} 
            className="w-full mt-6 flex items-center justify-center gap-2"
          >
            Continue to Financial Model
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
