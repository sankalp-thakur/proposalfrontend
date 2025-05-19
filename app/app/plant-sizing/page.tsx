"use client"

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { withAuth } from '../../form/authWrapper';

type Results = {
  totalHydrogenGenerated: number;
  totalHydrogenSupplied: number;
  totalHydrogenVented: number;
  peakStock: number;
  numberOfCylinders: number;
  capitalCost: number;
  zeroSupplyHours: number;
  zeroSupplyDays: number;
};

const PlantSizingPage: React.FC = () => {
  // Assumption states (initialized with default values from the Excel workbook)
  const [installedStack, setInstalledStack] = useState<number>(11000);        // Installed Stack Size (NM3/hour)
  const [cylinderCapacity, setCylinderCapacity] = useState<number>(26);       // Cylinder capacity (NM3 at 200 bar)
  const [cylinderCost, setCylinderCost] = useState<number>(32500);            // Cost per cylinder (in currency units)
  const [stockHighThreshold, setStockHighThreshold] = useState<number>(80000); // Stock volume threshold for high dispatch (NM3)
  const [supplyRateHigh, setSupplyRateHigh] = useState<number>(7649.125);     // High supply rate (NM3/hour) when stock > high threshold
  const [supplyRateLow, setSupplyRateLow] = useState<number>(6258.375);       // Base supply rate (NM3/hour) when stock above minimum threshold
  const [baseProfile, setBaseProfile] = useState<number[]>([]); // Hourly base profile (8760 values)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    const loadBaseProfile = async () => {
      setIsLoading(true);
      try {
        const profileModule = await import("@/app/data/baseProfile.json");
        setBaseProfile(profileModule.default as number[]);
      } catch (error) {
        console.error("Failed to load base profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBaseProfile();
  }, []);

  // Parse CSV text into an array of numbers
  const parseCSVProfile = (csvText: string): number[] => {
    const lines = csvText.trim().split(/\r?\n/);
    let values: string[] = [];
    if (lines.length === 1 && lines[0].includes(",")) {
      // Single-line CSV (comma-separated values)
      values = lines[0].split(",").map(val => val.trim());
    } else {
      // Multi-line CSV (one value per line)
      values = lines;
    }
    return values.map(val => parseFloat(val)).filter(num => !isNaN(num));
  };

  // Handle CSV file upload to override base profile
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result;
      if (typeof text === "string") {
        const profile = parseCSVProfile(text);
        if (profile.length > 0) {
          setBaseProfile(profile);
        }
      }
    };
    reader.readAsText(file);
  };

  // Generate and download a template CSV file with current base profile
  const downloadTemplate = () => {
    let csvContent = "";
    // Create CSV content with default/current values
    baseProfile.forEach((value, index) => {
      csvContent += value.toString();
      if (index < baseProfile.length - 1) {
        csvContent += "\n";
      }
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "hourly-profile-template.csv");
  };

  const runSimulation = useCallback((): Results => {
    const baseStackCapacity = 350;        // base profile stack size (NM3/hour) per Excel
    const storageCapacity = 100000;       // fixed total storage capacity (NM3)
    let stock = 0;
    let totalGen = 0;
    let totalSupplied = 0;
    let totalVented = 0;
    let zeroSupplyHours = 0;
    let peakStock = 0;
    const hours = baseProfile.length;
    for (let i = 0; i < hours; i++) {
      // Hourly hydrogen generation based on base profile and installed stack size
      const generation = (baseProfile[i] / baseStackCapacity) * installedStack;
      totalGen += generation;
      // Stock available before dispatch: previous stock plus current generation
      const stockPreSupply = stock + generation;
      // Determine supply to client (Contracted Supply to CPCL) based on dispatch thresholds
      let supply = 0;
      if (stockPreSupply > stockHighThreshold) {
        supply = supplyRateHigh;
      } else if (stockPreSupply > supplyRateLow) {
        supply = supplyRateLow;
      } else {
        supply = 0;
      }
      if (supply <= 0) {
        zeroSupplyHours++;
      }
      // Do not supply more than available stock
      if (supply > stockPreSupply) {
        supply = stockPreSupply;
      }
      // Update stock after supplying to client
      let stockAfterSupply = stockPreSupply - supply;
      // Vent excess hydrogen if storage is full
      let vent = 0;
      if (stockAfterSupply > storageCapacity) {
        if (generation > supplyRateHigh) {
          // Vent all generation that could not be supplied (storage full)
          vent = generation - supply;
        } else {
          vent = 0;
        }
        stockAfterSupply -= vent;
        totalVented += vent;
      }
      // Carry over remaining stock to next hour
      stock = stockAfterSupply;
      if (stock > peakStock) {
        peakStock = stock;
      }
      totalSupplied += supply;
    }
    const zeroSupplyDays = Math.ceil(zeroSupplyHours / 24);
    const numberOfCylinders = Math.ceil(peakStock / cylinderCapacity);
    const capitalCost = numberOfCylinders * cylinderCost;
    return {
      totalHydrogenGenerated: totalGen,
      totalHydrogenSupplied: totalSupplied,
      totalHydrogenVented: totalVented,
      peakStock: peakStock,
      numberOfCylinders: numberOfCylinders,
      capitalCost: capitalCost,
      zeroSupplyHours: zeroSupplyHours,
      zeroSupplyDays: zeroSupplyDays
    };
  }, [installedStack, cylinderCapacity, cylinderCost, stockHighThreshold, supplyRateHigh, supplyRateLow, baseProfile]);
  
  const memoizedResults = useMemo(() => runSimulation(), [runSimulation]);
  
  // Update results state when memoized results change
  useEffect(() => {
    setResults(memoizedResults);
  }, [memoizedResults]);

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Loading Plant Sizing Simulation...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Plant Sizing Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="installedStack">Installed Stack Size (NM3/h):</Label>
                <Input 
                  id="installedStack"
                  type="number" 
                  value={installedStack} 
                  onChange={e => setInstalledStack(Number(e.target.value))}
                />
              </div>
            <div className="space-y-2">
              <Label htmlFor="cylinderCapacity">Cylinder Capacity (NM3 @ 200 bar):</Label>
              <Input 
                id="cylinderCapacity"
                type="number" 
                value={cylinderCapacity} 
                onChange={e => setCylinderCapacity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cylinderCost">Cylinder Cost (per cylinder):</Label>
              <Input 
                id="cylinderCost"
                type="number" 
                value={cylinderCost} 
                onChange={e => setCylinderCost(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockHighThreshold">High Stock Threshold (NM3):</Label>
              <Input 
                id="stockHighThreshold"
                type="number" 
                value={stockHighThreshold} 
                onChange={e => setStockHighThreshold(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplyRateHigh">High Supply Rate (NM3/h):</Label>
              <Input 
                id="supplyRateHigh"
                type="number" 
                value={supplyRateHigh} 
                onChange={e => setSupplyRateHigh(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplyRateLow">Low (Base) Supply Rate (NM3/h):</Label>
              <Input 
                id="supplyRateLow"
                type="number" 
                value={supplyRateLow} 
                onChange={e => setSupplyRateLow(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="profileUpload">Upload Custom 8760 Profile (CSV):</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input 
                id="profileUpload"
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="flex-1" 
              />
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="whitespace-nowrap"
              >
                Download Template
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Download the template, edit the values, and upload it back to ensure correct formatting.
            </p>
          </div>
        </CardContent>
      </Card>
      )}
      
      {!isLoading && results && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <div className="font-medium">Total Hydrogen Generated:</div>
                <div className="text-xl font-bold">{Math.round(results.totalHydrogenGenerated).toLocaleString()}</div>
                <div className="text-sm text-gray-500">NM3</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Total Hydrogen Supplied:</div>
                <div className="text-xl font-bold">{Math.round(results.totalHydrogenSupplied).toLocaleString()}</div>
                <div className="text-sm text-gray-500">NM3</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Total Hydrogen Vented:</div>
                <div className="text-xl font-bold">{Math.round(results.totalHydrogenVented).toLocaleString()}</div>
                <div className="text-sm text-gray-500">NM3</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Peak Storage Level:</div>
                <div className="text-xl font-bold">{Math.round(results.peakStock).toLocaleString()}</div>
                <div className="text-sm text-gray-500">NM3</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Zero-Supply Hours:</div>
                <div className="text-xl font-bold">{results.zeroSupplyHours}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Zero-Supply Days:</div>
                <div className="text-xl font-bold">{results.zeroSupplyDays}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Number of Cylinders Required:</div>
                <div className="text-xl font-bold">{results.numberOfCylinders.toLocaleString()}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Estimated Capital Cost:</div>
                <div className="text-xl font-bold">{results.capitalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default withAuth(PlantSizingPage);              
