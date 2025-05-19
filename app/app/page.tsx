"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FinancialModelSummary } from "@/components/FinancialModelSummary"
import { ArrowRight, ArrowLeft, Upload } from "lucide-react"
import { withAuth } from '../form/authWrapper'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { optimizationFormSchema, OptimizationFormValues } from '../utils/form'
import { ProgressBar } from "@/components/ProgressBar"
import { ProjectDetailsForm } from "@/components/ProjectDetailsForm"
import dynamic from 'next/dynamic'

const NetworkEditor = dynamic(() => import('./network-editor/components/NetworkEditor'), {
  ssr: false,
});

interface FinancialModel {
  name: string;
}

interface OptimizationRun {
  created_at: string;
  operation_run_id: string;
  status: string;
  updated_at: string;
}

interface ProjectDetails {
  name: string;
  latitude?: number;
  longitude?: number;
  financial_model: string;
  client_id?: string;
}

const steps = [
  { id: 'project-details', label: 'Project Details' },
  { id: 'financial-model', label: 'Financial Model' },
  { id: 'assumptions-variables', label: 'Assumptions & Variables' },
  { id: 'network-editor', label: 'Network Editor' },
];

function RunOptimizationPage() {
  const [currentStep, setCurrentStep] = useState<string>('project-details')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: '',
    financial_model: ''
  })
  const [networkConfig, setNetworkConfig] = useState<any>({
    modules: [],
    connections: []
  })
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
      } else if (result.status === 'queued') {
        toast.success("Your request has been queued. Results will be sent to your email address in approximately one hour.")
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

  // Add handlers for step navigation and form submission
  const handleStepChange = (stepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const targetIndex = steps.findIndex(step => step.id === stepId);
    
    if (targetIndex < currentIndex) {
      setCurrentStep(stepId);
    }
  };
  
  const handleProjectDetailsSubmit = (data: ProjectDetails) => {
    setProjectDetails({
      ...projectDetails,
      ...data
    });
    setCurrentStep('financial-model');
  };
  
  const handleNetworkChange = (nodes: any[], edges: any[]) => {
    setNetworkConfig({
      modules: nodes,
      connections: edges
    });
  };
  
  const handleAssumptionsSubmit = async (values: OptimizationFormValues) => {
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
    
    setCurrentStep('network-editor');
  };
  
  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    try {
      const optimizationData = {
        client_id: projectDetails.client_id || '',
        name: projectDetails.name,
        latitude: projectDetails.latitude,
        longitude: projectDetails.longitude,
        financial_model: projectDetails.financial_model,
        network_configuration: networkConfig,
        ui_variables: form.getValues()
      };
      
      const requestBody = JSON.stringify(optimizationData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Optimization request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (response.status === 202) {
        toast.success(`Optimization started with run id ${result.operation_run_id}`);
      } else if (result.status === 'queued') {
        toast.success("Your request has been queued. Results will be sent to your email address in approximately one hour.");
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while submitting your optimization request. Please try again.");
      setError(error.message || "An error occurred while submitting your optimization request.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Green Hydrogen Project Sizing Optimizer</CardTitle>
          <CardDescription>
            Configure your green hydrogen project parameters to find optimal sizing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressBar 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={handleStepChange}
            allowBackNavigation={true}
          />
          
          {currentStep === 'project-details' && (
            <ProjectDetailsForm 
              initialData={projectDetails}
              onSubmit={handleProjectDetailsSubmit}
            />
          )}
          
          {currentStep === 'financial-model' && (
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
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="mr-2"
                    >
                      Browse...
                    </Button>
                    <span className="text-sm text-gray-500">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </span>
                  </div>
                  <Button 
                    onClick={handleUploadClick}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep('project-details')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project Details
                </Button>
                
                <Button 
                  onClick={() => setCurrentStep('assumptions-variables')}
                  className="flex items-center gap-2"
                >
                  Continue to Assumptions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 'assumptions-variables' && (
            <div>
              {projectDetails.financial_model && (
                <FinancialModelSummary 
                  model={{ name: projectDetails.financial_model, description: '' }}
                  customInputs={customInputs}
                />
              )}
              <form onSubmit={form.handleSubmit(handleAssumptionsSubmit)} className="space-y-4">
                <div className="grid gap-4">
                  <h2 className="text-xl font-semibold mt-4">A. Assumptions (fixed inputs)</h2>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3">Demand &amp; Commercial Contract</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="client_h2flowrate">Customer required H₂ flow rate (NM³/hour):</Label>
                        <Input id="client_h2flowrate" {...form.register("client_h2flowrate")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="client_h2flowhours">Hours of H₂ supply at flow rate:</Label>
                        <Input id="client_h2flowhours" {...form.register("client_h2flowhours")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="projectLifetime">Project contract lifetime (Years):</Label>
                        <Input id="projectLifetime" {...form.register("projectLifetime")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="contractCurrency">Contract pricing currency (USD/INR):</Label>
                        <Input id="contractCurrency" {...form.register("contractCurrency")} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <h3 className="text-lg font-semibold mb-3">Oxygen &amp; Hydrogen Market</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="o2MarketSellClientOfftake">O₂ market sell/Client Offtake (Yes/No):</Label>
                        <Input id="o2MarketSellClientOfftake" {...form.register("o2MarketSellClientOfftake")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="o2MarketSellLimit">O₂ market sell limit (Nm³/month):</Label>
                        <Input id="o2MarketSellLimit" {...form.register("o2MarketSellLimit")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="excessProductionH2Merchant">Excess production H₂ merchant market sell (Yes/No):</Label>
                        <Input id="excessProductionH2Merchant" {...form.register("excessProductionH2Merchant")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="excessProductionH2MerchantLimit">Excess production H₂ merchant market sell limit (Nm³/month):</Label>
                        <Input id="excessProductionH2MerchantLimit" {...form.register("excessProductionH2MerchantLimit")} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <h3 className="text-lg font-semibold mb-3">Delivery Conditions &amp; Grid Interaction</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="supplyPressureVsEL">Supply pressure vs. EL (Low/High):</Label>
                        <Input id="supplyPressureVsEL" {...form.register("supplyPressureVsEL")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="injectExcessPower">Inject excess power to client/grid (Yes/No):</Label>
                        <Input id="injectExcessPower" {...form.register("injectExcessPower")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="drawPowerFromClient">Draw power from client/grid (use as battery) (Yes/No):</Label>
                        <Input id="drawPowerFromClient" {...form.register("drawPowerFromClient")} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <h3 className="text-lg font-semibold mb-3">Electrolyser Technology &amp; Performance</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="electrolyzerType">Electrolyzer Type (AEC/PEM):</Label>
                        <Input id="electrolyzerType" {...form.register("electrolyzerType")} />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="electrolyzerstackConversion100Percent">Electrolyzer stack conversion (100% flow) (KwH/NM³):</Label>
                        <Input id="electrolyzerstackConversion100Percent" {...form.register("electrolyzerstackConversion100Percent")} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <h3 className="text-lg font-semibold mb-3">Optimization Variables</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1/3">
                          <Label htmlFor="electrolyser_size_low">Electrolyser Capacity (MW):</Label>
                        </div>
                        <div className="w-1/3">
                          <Input id="electrolyser_size_low" {...form.register("electrolyser_size_low")} />
                        </div>
                        <div className="w-1/12 text-center">
                          <span>to</span>
                        </div>
                        <div className="w-1/4">
                          <Input id="electrolyser_size_high" {...form.register("electrolyser_size_high")} />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-1/3">
                          <Label htmlFor="battery_size_low">Battery Capacity (kWh):</Label>
                        </div>
                        <div className="w-1/3">
                          <Input id="battery_size_low" {...form.register("battery_size_low")} />
                        </div>
                        <div className="w-1/12 text-center">
                          <span>to</span>
                        </div>
                        <div className="w-1/4">
                          <Input id="battery_size_high" {...form.register("battery_size_high")} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep('project-details')}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Project Details
                    </Button>
                    
                    <Button type="submit" className="flex items-center gap-2">
                      Continue to Network Editor
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {currentStep === 'network-editor' && (
            <div className="space-y-4">
              <div className="h-[600px] border rounded-md">
                <NetworkEditor />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('assumptions-variables')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Assumptions
                </Button>
                
                <Button 
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="bg-[#1A3721] text-white hover:bg-[#2A4731] hover:text-[#CCFF00]"
                >
                  {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(RunOptimizationPage);
