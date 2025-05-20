"use client"

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FinancialModelSummary } from "@/components/FinancialModelSummary"
import { ArrowRight, Upload } from "lucide-react"
import { withAuth } from '../form/authWrapper'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { optimizationFormSchema, OptimizationFormValues } from '../utils/form'

interface FinancialModel {
  name: string;
}

interface OptimizationRun {
  created_at: string;
  operation_run_id: string;
  status: string;
  updated_at: string;
}

function RunOptimizationPage() {
  const [activeTab, setActiveTab] = useState("financial-model")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedRun, setSelectedRun] = useState<OptimizationRun | null>(null)
  const [optimizationRuns, setOptimizationRuns] = useState<OptimizationRun[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [financialModels, setFinancialModels] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const form = useForm<OptimizationFormValues>({
    resolver: zodResolver(optimizationFormSchema) as any,
    defaultValues: {
      client_h2flowrate: '0',
      client_h2flowhours: '24',
      projectLifetime: '20',
      contractCurrency: 'INR',
      o2MarketSellClientOfftake: 'Yes',
      o2MarketSellLimit: '999999999',
      excessProductionH2Merchant: 'Yes',
      excessProductionH2MerchantLimit: '999999999',
      supplyPressureVsEL: 'High',
      injectExcessPower: 'Yes',
      drawPowerFromClient: 'Yes',
      electrolyzerType: 'AEC',
      electrolyzerstackConversion100Percent: '4.6350',
      electrolyzerstackConversionMinTurndown: '3.744',
      stackMinTurndownratio: '0.2',
      stackefficiencydegradation: '0.00916667',
      stackLifetime: '82000',
      TotalAuxRatedPowerDuringOperating: '156',
      TotalAuxRatedPowerOutsideOperating: '42',
      PvType: 'Mono',
      PVOutputAnnualDegradation: '0.005',
      PvPlacement: 'GM',
      BatteryroundtripEfficiency: '0.85',
      BatteryLife: '11',
      BatteryCapacityAnnualDegradation: '0.0235',
      PV_DC_size_LowerRange: '6.8745',
      PV_DC_size_HigherRange: '6.8745',
      inverter_ac_size_low: '5.1967',
      inverter_ac_size_high: '5.1967',
      wind_size_low: '4.0664',
      wind_size_high: '4.0664',
      power_evactuation_size_low: '6',
      power_evactuation_size_high: '6',
      ltoa_size_low: '0',
      ltoa_size_high: '0',
      battery_size_low: '857.71',
      battery_size_high: '857.71',
      electrolyser_size_low: '3.2445',
      electrolyser_size_high: '3.2445',
      low_bar_h2_storage_size_low: '215',
      low_bar_h2_storage_size_high: '215',
      high_bar_h2_storage_size_low: '12000',
      high_bar_h2_storage_size_high: '12000',
      h2_compressor_throughput_low: '700',
      h2_compressor_throughput_high: '700',
      o2_storage_low: '106',
      o2_storage_high: '106',
      o2_compressor_throughput_low: '350',
      o2_compressor_throughput_high: '350'
    }
  })

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

      const data = await response.json();
      setFinancialModels(data);
    } catch (error) {
      console.error('Error fetching financial models:', error);
      toast.error('Failed to load financial models. Please try again later.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    // Check if file is an Excel file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/uploadFinancialModel`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      toast.success('Financial model uploaded successfully');
      
      // Reset the file input and selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the list of financial models
      fetchFinancialModels();
    } catch (error) {
      console.error('Error uploading financial model:', error);
      toast.error('Failed to upload financial model. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: OptimizationFormValues) => {
    // Convert numeric values to floats
    const numericFields = [
      "client_h2flowrate", "client_h2flowhours", "projectLifetime", "o2MarketSellLimit",
      "excessProductionH2MerchantLimit", "electrolyzerstackConversion100Percent",
      "electrolyzerstackConversionMinTurndown", "stackMinTurndownratio", "stackefficiencydegradation",
      "stackLifetime", "TotalAuxRatedPowerDuringOperating", "TotalAuxRatedPowerOutsideOperating",
      "BatteryroundtripEfficiency", "BatteryLife", "BatteryCapacityAnnualDegradation",
      "PVOutputAnnualDegradation", "PV_DC_size_LowerRange", "PV_DC_size_HigherRange",
      "inverter_ac_size_low", "inverter_ac_size_high", "wind_size_low", "wind_size_high",
      "power_evactuation_size_low", "power_evactuation_size_high", "ltoa_size_low", "ltoa_size_high",
      "battery_size_low", "battery_size_high", "electrolyser_size_low", "electrolyser_size_high",
      "low_bar_h2_storage_size_low", "low_bar_h2_storage_size_high", "high_bar_h2_storage_size_low",
      "high_bar_h2_storage_size_high", "h2_compressor_throughput_low", "h2_compressor_throughput_high",
      "o2_storage_low", "o2_storage_high", "o2_compressor_throughput_low", "o2_compressor_throughput_high"
    ]

    const processedValues = { ...values }
    
    // Convert numeric fields to numbers for API submission
    numericFields.forEach(field => {
      const fieldName = field as keyof typeof processedValues
      if (processedValues[fieldName] !== undefined) {
        const value = processedValues[fieldName]
        if (typeof value === 'string') {
          const parsedValue = parseFloat(value)
          if (!isNaN(parsedValue)) {
            processedValues[fieldName] = parsedValue as any
          }
        }
      }
    })

    setIsOptimizing(true)

    try {
      const requestBody = JSON.stringify({ Ui_variables: processedValues })

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: requestBody,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Optimization request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (response.status === 202) {
        toast.success(`Optimization started with run id ${result.operation_run_id}`)
        setActiveTab("results")
      } else if (result.status === 'queued') {
        toast.success("Your request has been queued. Results will be sent to your email address in approximately one hour.")
        setActiveTab("results")
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while submitting your optimization request. Please try again.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const customInputs = {
    // Add your custom input data here if needed
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRunClick = async (run: OptimizationRun) => {
    // API call for detailed view will be added here later
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial-model">Financial Model</TabsTrigger>
          <TabsTrigger value="assumptions-variables">Assumptions & Variables</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="financial-model">
          <Card>
            <CardHeader>
              <CardTitle>Select Financial Model</CardTitle>
              <CardDescription>Choose a financial model for your project optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Upload New Financial Model</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 flex items-center p-2 border rounded">
                      <Input 
                        id="modelUpload"
                        ref={fileInputRef}
                        type="file" 
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden" 
                        disabled={isUploading}
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="mr-2"
                      >
                        Choose File
                      </Button>
                      <span className="text-gray-600 truncate">
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="whitespace-nowrap"
                      disabled={isUploading || !selectedFile}
                      onClick={handleUploadClick}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Excel'}
                      <Upload className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload an Excel file (.xlsx or .xls) with your financial model.
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Select Existing Model</h3>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel} 
                    onOpenChange={(open) => {
                      if (open && financialModels.length === 0) {
                        fetchFinancialModels();
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-10 px-3 py-2 text-base border rounded-md bg-white text-black">
                      <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a financial model"} className="text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {financialModels.map((modelName) => (
                        <SelectItem key={modelName} value={modelName} className="cursor-pointer hover:bg-gray-100">
                          {modelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => setActiveTab("assumptions-variables")} 
                  disabled={!selectedModel || isLoadingModels}
                  className="w-full mt-6 flex items-center justify-center gap-2"
                >
                  Continue to Assumptions & Variables
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assumptions-variables">
          <Card>
            <CardHeader>
              <CardTitle>Assumptions & Variables</CardTitle>
              <CardDescription>Set your project assumptions and variables</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedModel && (
                <FinancialModelSummary 
                  model={{ name: selectedModel, description: '' }}
                  customInputs={customInputs}
                />
              )}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <h2 className="text-xl font-semibold mt-4">A. Assumptions (fixed inputs)</h2>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Demand & Commercial Contract</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="client_h2flowrate" className="col-span-2">Customer required H₂ flow rate (NM³/hour):</Label>
                      <Input id="client_h2flowrate" {...form.register("client_h2flowrate")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="client_h2flowhours" className="col-span-2">Hours of H₂ supply at flow rate:</Label>
                      <Input id="client_h2flowhours" {...form.register("client_h2flowhours")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="projectLifetime" className="col-span-2">Project contract lifetime (Years):</Label>
                      <Input id="projectLifetime" {...form.register("projectLifetime")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contractCurrency" className="col-span-2">Contract pricing currency (USD/INR):</Label>
                      <Input id="contractCurrency" {...form.register("contractCurrency")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="o2MarketSellClientOfftake" className="col-span-2">O₂ market sell/Client Offtake (Yes/No):</Label>
                      <Input id="o2MarketSellClientOfftake" {...form.register("o2MarketSellClientOfftake")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="o2MarketSellLimit" className="col-span-2">O₂ market sell limit (Nm³/month):</Label>
                      <Input id="o2MarketSellLimit" {...form.register("o2MarketSellLimit")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="excessProductionH2Merchant" className="col-span-2">Excess production H₂ merchant market sell (Yes/No):</Label>
                      <Input id="excessProductionH2Merchant" {...form.register("excessProductionH2Merchant")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="excessProductionH2MerchantLimit" className="col-span-2">Excess production H₂ merchant market sell limit (Nm³/month):</Label>
                      <Input id="excessProductionH2MerchantLimit" {...form.register("excessProductionH2MerchantLimit")} className="col-span-2" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Delivery Conditions & Grid Interaction</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplyPressureVsEL" className="col-span-2">Supply pressure vs. EL (Low/High):</Label>
                      <Input id="supplyPressureVsEL" {...form.register("supplyPressureVsEL")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="injectExcessPower" className="col-span-2">Inject excess power to client/grid (Yes/No):</Label>
                      <Input id="injectExcessPower" {...form.register("injectExcessPower")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="drawPowerFromClient" className="col-span-2">Draw power from client/grid (use as battery) (Yes/No):</Label>
                      <Input id="drawPowerFromClient" {...form.register("drawPowerFromClient")} className="col-span-2" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Electrolyser Technology & Performance</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="electrolyzerType" className="col-span-2">Electrolyzer Type (AEC/PEM):</Label>
                      <Input id="electrolyzerType" {...form.register("electrolyzerType")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="electrolyzerstackConversion100Percent" className="col-span-2">Electrolyzer stack conversion (100% flow) (KwH/NM³):</Label>
                      <Input id="electrolyzerstackConversion100Percent" {...form.register("electrolyzerstackConversion100Percent")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="electrolyzerstackConversionMinTurndown" className="col-span-2">Electrolyzer stack conversion (min turndown flow) (KwH/NM³):</Label>
                      <Input id="electrolyzerstackConversionMinTurndown" {...form.register("electrolyzerstackConversionMinTurndown")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stackMinTurndownratio" className="col-span-2">Stack min turndown ratio %:</Label>
                      <Input id="stackMinTurndownratio" {...form.register("stackMinTurndownratio")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stackefficiencydegradation" className="col-span-2">Stack efficiency annual degradation (%):</Label>
                      <Input id="stackefficiencydegradation" {...form.register("stackefficiencydegradation")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stackLifetime" className="col-span-2">Lifetime of electrolyzer stack (Hours):</Label>
                      <Input id="stackLifetime" {...form.register("stackLifetime")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="TotalAuxRatedPowerDuringOperating" className="col-span-2">Total AUX rated power (during EL operating) (KW):</Label>
                      <Input id="TotalAuxRatedPowerDuringOperating" {...form.register("TotalAuxRatedPowerDuringOperating")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="TotalAuxRatedPowerOutsideOperating" className="col-span-2">Total AUX rated power (outside EL operating) (KW):</Label>
                      <Input id="TotalAuxRatedPowerOutsideOperating" {...form.register("TotalAuxRatedPowerOutsideOperating")} className="col-span-2" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Renewable Generation</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="PvType" className="col-span-2">PV type (Poly/Mono):</Label>
                      <Input id="PvType" {...form.register("PvType")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="PVOutputAnnualDegradation" className="col-span-2">PV output annual degradation (%):</Label>
                      <Input id="PVOutputAnnualDegradation" {...form.register("PVOutputAnnualDegradation")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="PvPlacement" className="col-span-2">Placement (Rooftop/Ground mounted) (RT/GM):</Label>
                      <Input id="PvPlacement" {...form.register("PvPlacement")} className="col-span-2" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Electrical & Battery System</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="BatteryroundtripEfficiency" className="col-span-2">Battery round-trip efficiency (%):</Label>
                      <Input id="BatteryroundtripEfficiency" {...form.register("BatteryroundtripEfficiency")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="BatteryLife" className="col-span-2">Battery life (Years):</Label>
                      <Input id="BatteryLife" {...form.register("BatteryLife")} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="BatteryCapacityAnnualDegradation" className="col-span-2">Battery capacity annual degradation (%):</Label>
                      <Input id="BatteryCapacityAnnualDegradation" {...form.register("BatteryCapacityAnnualDegradation")} className="col-span-2" />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mt-6">B. Variables (design knobs to iterate)</h2>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Renewable Generation</h3>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="PV_DC_size_LowerRange" className="col-span-2">PV DC Size (MW<sub>PV-DC</sub>):</Label>
                      <Input id="PV_DC_size_LowerRange" {...form.register("PV_DC_size_LowerRange")} className="col-span-2" />
                      <Label htmlFor="PV_DC_size_HigherRange" className="col-span-1 text-center">to</Label>
                      <Input id="PV_DC_size_HigherRange" {...form.register("PV_DC_size_HigherRange")} className="col-span-1" />
                    </div>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="inverter_ac_size_low" className="col-span-2">Inverter AC Size (MW<sub>PV-AC</sub>):</Label>
                      <Input id="inverter_ac_size_low" {...form.register("inverter_ac_size_low")} className="col-span-2" />
                      <Label htmlFor="inverter_ac_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="inverter_ac_size_high" {...form.register("inverter_ac_size_high")} className="col-span-1" />
                    </div>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="wind_size_low" className="col-span-2">Wind Turbine Size (MW<sub>WTG-DC</sub>):</Label>
                      <Input id="wind_size_low" {...form.register("wind_size_low")} className="col-span-2" />
                      <Label htmlFor="wind_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="wind_size_high" {...form.register("wind_size_high")} className="col-span-1" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Transmission / Interconnect</h3>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="power_evactuation_size_low" className="col-span-2">Power Evacuation Capacity (MW<sub>AC-Evac</sub>):</Label>
                      <Input id="power_evactuation_size_low" {...form.register("power_evactuation_size_low")} className="col-span-2" />
                      <Label htmlFor="power_evactuation_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="power_evactuation_size_high" {...form.register("power_evactuation_size_high")} className="col-span-1" />
                    </div>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="ltoa_size_low" className="col-span-2">LTOA Capacity (MW<sub>LTOA</sub>):</Label>
                      <Input id="ltoa_size_low" {...form.register("ltoa_size_low")} className="col-span-2" />
                      <Label htmlFor="ltoa_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="ltoa_size_high" {...form.register("ltoa_size_high")} className="col-span-1" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Battery System</h3>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="battery_size_low" className="col-span-2">Battery Energy Capacity (kWh<sub>Bat</sub>):</Label>
                      <Input id="battery_size_low" {...form.register("battery_size_low")} className="col-span-2" />
                      <Label htmlFor="battery_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="battery_size_high" {...form.register("battery_size_high")} className="col-span-1" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Power-to-Hydrogen Conversion</h3>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="electrolyser_size_low" className="col-span-2">Electrolyser Aggregate Capacity (MW<sub>EL-AC</sub>):</Label>
                      <Input id="electrolyser_size_low" {...form.register("electrolyser_size_low")} className="col-span-2" />
                      <Label htmlFor="electrolyser_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="electrolyser_size_high" {...form.register("electrolyser_size_high")} className="col-span-1" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">H₂ Storage & Compression</h3>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="low_bar_h2_storage_size_low" className="col-span-2">Low-pressure H₂ Storage (Nm³<sub>H₂-LP</sub>):</Label>
                      <Input id="low_bar_h2_storage_size_low" {...form.register("low_bar_h2_storage_size_low")} className="col-span-2" />
                      <Label htmlFor="low_bar_h2_storage_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="low_bar_h2_storage_size_high" {...form.register("low_bar_h2_storage_size_high")} className="col-span-1" />
                    </div>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="high_bar_h2_storage_size_low" className="col-span-2">High-pressure H₂ Storage (Nm³<sub>H₂-HP</sub>):</Label>
                      <Input id="high_bar_h2_storage_size_low" {...form.register("high_bar_h2_storage_size_low")} className="col-span-2" />
                      <Label htmlFor="high_bar_h2_storage_size_high" className="col-span-1 text-center">to</Label>
                      <Input id="high_bar_h2_storage_size_high" {...form.register("high_bar_h2_storage_size_high")} className="col-span-1" />
                    </div>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="h2_compressor_throughput_low" className="col-span-2">H₂ Compressor Throughput (Nm³ h⁻¹<sub>Comp-H₂</sub>):</Label>
                      <Input id="h2_compressor_throughput_low" {...form.register("h2_compressor_throughput_low")} className="col-span-2" />
                      <Label htmlFor="h2_compressor_throughput_high" className="col-span-1 text-center">to</Label>
                      <Input id="h2_compressor_throughput_high" {...form.register("h2_compressor_throughput_high")} className="col-span-1" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">O₂ Handling</h3>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="o2_storage_low" className="col-span-2">O₂ Storage (Nm³<sub>O₂-Stor</sub>):</Label>
                      <Input id="o2_storage_low" {...form.register("o2_storage_low")} className="col-span-2" />
                      <Label htmlFor="o2_storage_high" className="col-span-1 text-center">to</Label>
                      <Input id="o2_storage_high" {...form.register("o2_storage_high")} className="col-span-1" />
                    </div>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="o2_compressor_throughput_low" className="col-span-2">O₂ Compressor Throughput (Nm³ h⁻¹<sub>Comp-O₂</sub>):</Label>
                      <Input id="o2_compressor_throughput_low" {...form.register("o2_compressor_throughput_low")} className="col-span-2" />
                      <Label htmlFor="o2_compressor_throughput_high" className="col-span-1 text-center">to</Label>
                      <Input id="o2_compressor_throughput_high" {...form.register("o2_compressor_throughput_high")} className="col-span-1" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    className="mt-6 bg-[#1A3721] text-white hover:bg-[#2A4731] hover:text-[#CCFF00] transition-colors duration-200 font-semibold px-8 py-2 rounded-lg" 
                    disabled={isOptimizing}
                  >
                    {isOptimizing ? 'Submitting...' : 'Optimize'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {selectedRun ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-semibold">Run Details</CardTitle>
                      <CardDescription>
                        ID: {selectedRun.operation_run_id || 'N/A'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedRun(null)}
                      className="ml-4"
                    >
                      Back to List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Created</h3>
                        <p className="mt-1 text-sm">{formatDate(selectedRun.created_at)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Updated</h3>
                        <p className="mt-1 text-sm">{formatDate(selectedRun.updated_at)}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRun.status)}`}>
                        {selectedRun.status}
                      </span>
                    </div>
                    {/* Additional details will be added here when the API is provided */}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No run selected</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(RunOptimizationPage);
