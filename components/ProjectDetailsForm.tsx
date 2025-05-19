"use client"

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

const projectDetailsSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  financial_model: z.string().min(1, "Financial model is required")
});

type ProjectDetailsFormValues = z.infer<typeof projectDetailsSchema>;

interface ProjectDetailsFormProps {
  initialData?: Partial<ProjectDetailsFormValues>;
  onSubmit: (data: ProjectDetailsFormValues) => void;
}

export function ProjectDetailsForm({ initialData = {}, onSubmit }: ProjectDetailsFormProps) {
  const [financialModels, setFinancialModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  const form = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: {
      name: initialData.name || '',
      latitude: initialData.latitude,
      longitude: initialData.longitude,
      financial_model: initialData.financial_model || ''
    }
  });
  
  useEffect(() => {
    fetchFinancialModels();
  }, []);
  
  const fetchFinancialModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getFinancialModels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const models = await response.json();
      setFinancialModels(models);
    } catch (error) {
      console.error('Error fetching financial models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter project name"
            className="mt-1"
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              {...form.register("latitude", { 
                setValueAs: (v) => v === "" ? undefined : parseFloat(v) 
              })}
              placeholder="e.g. 28.6139"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              {...form.register("longitude", { 
                setValueAs: (v) => v === "" ? undefined : parseFloat(v) 
              })}
              placeholder="e.g. 77.2090"
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="financial_model">Financial Model</Label>
          <Select
            value={form.watch("financial_model")}
            onValueChange={(value) => form.setValue("financial_model", value, { shouldValidate: true })}
            onOpenChange={(open) => {
              if (open && financialModels.length === 0) {
                fetchFinancialModels();
              }
            }}
          >
            <SelectTrigger id="financial_model" className="mt-1">
              <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a financial model"} />
            </SelectTrigger>
            <SelectContent>
              {financialModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.financial_model && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.financial_model.message}</p>
          )}
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full mt-6 flex items-center justify-center gap-2"
      >
        Continue to Assumptions &amp; Variables
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
