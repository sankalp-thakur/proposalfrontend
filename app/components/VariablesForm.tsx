"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface VariableGroup {
  title: string
  description: string
  variables: {
    name: string
    label: string
    type: 'number' | 'select' | 'switch' | 'range'
    unit?: string
    options?: { value: string; label: string }[]
    min?: number
    max?: number
    step?: number
  }[]
}

const variableGroups: VariableGroup[] = [
  {
    title: "Core Requirements",
    description: "Basic project parameters and specifications",
    variables: [
      { name: "h2FlowRate", label: "H2 Flow Rate", type: "number", unit: "NM3/hour" },
      { name: "supplyHours", label: "Hours of H2 Supply", type: "number", unit: "hours" },
      { name: "supplyPressure", label: "Supply Pressure", type: "select", options: [
        { value: "low", label: "Low" },
        { value: "high", label: "High" }
      ]},
      { name: "contractLifetime", label: "Project Contract Lifetime", type: "number", unit: "years" },
      { name: "currency", label: "Contract Pricing Currency", type: "select", options: [
        { value: "USD", label: "USD" },
        { value: "INR", label: "INR" }
      ]}
    ]
  },
  {
    title: "Market Configuration",
    description: "Revenue streams and market participation settings",
    variables: [
      { name: "o2MarketSell", label: "O2 Market Sell", type: "switch" },
      { name: "o2MarketLimit", label: "O2 Market Sell Limit", type: "number", unit: "Nm3/month" },
      { name: "excessH2Sell", label: "Excess H2 Merchant Market Sell", type: "switch" },
      { name: "excessH2Limit", label: "Excess H2 Market Sell Limit", type: "number", unit: "Nm3/month" },
      { name: "injectExcessPower", label: "Inject Excess Power to Grid", type: "switch" },
      { name: "drawPower", label: "Draw Power from Grid", type: "switch" }
    ]
  },
  {
    title: "Electrolyzer Configuration",
    description: "Technical specifications for the electrolyzer system",
    variables: [
      { name: "electrolyzerType", label: "Electrolyzer Type", type: "select", options: [
        { value: "AEC", label: "AEC" },
        { value: "PEM", label: "PEM" }
      ]},
      { name: "stackConversion", label: "Stack Conversion (100% flow)", type: "number", unit: "KwH/NM3" },
      { name: "minTurndownConversion", label: "Stack Conversion (min turndown)", type: "number", unit: "KwH/NM3" },
      { name: "minTurndownRatio", label: "Stack Min Turndown Ratio", type: "number", unit: "%" },
      { name: "stackDegradation", label: "Stack Efficiency Annual Degradation", type: "number", unit: "%" },
      { name: "stackLifetime", label: "Lifetime of Electrolyzer Stack", type: "number", unit: "hours" }
    ]
  },
  {
    title: "Power System",
    description: "Power generation and storage configuration",
    variables: [
      { name: "auxPowerOperating", label: "Total AUX Rated Power (during EL operating)", type: "number", unit: "KW" },
      { name: "auxPowerNonOperating", label: "Total AUX Rated Power (outside EL operating)", type: "number", unit: "KW" },
      { name: "batteryEfficiency", label: "Battery Round-trip Efficiency", type: "number", unit: "%" },
      { name: "batteryLife", label: "Battery Life", type: "number", unit: "years" },
      { name: "batteryDegradation", label: "Battery Capacity Annual Degradation", type: "number", unit: "%" }
    ]
  },
  {
    title: "Renewable Energy",
    description: "Solar and wind power configuration",
    variables: [
      { name: "pvType", label: "PV Type", type: "select", options: [
        { value: "Poly", label: "Poly" },
        { value: "Mono", label: "Mono" }
      ]},
      { name: "pvDegradation", label: "PV Output Annual Degradation", type: "number", unit: "%" },
      { name: "placement", label: "Placement", type: "select", options: [
        { value: "RT", label: "Rooftop" },
        { value: "GM", label: "Ground Mounted" }
      ]}
    ]
  },
  {
    title: "System Sizing",
    description: "Component sizing ranges",
    variables: [
      { name: "pvDcSize", label: "PV DC Size", type: "range", unit: "MWPV-DC", min: 0, max: 100, step: 0.1 },
      { name: "pvAcSize", label: "Inverter AC Size", type: "range", unit: "MWPV-AC", min: 0, max: 100, step: 0.1 },
      { name: "windSize", label: "Wind Size", type: "range", unit: "MWWTG-DC", min: 0, max: 100, step: 0.1 },
      { name: "powerEvacuation", label: "Power Evacuation Size", type: "range", unit: "MWAC", min: 0, max: 100, step: 0.1 },
      { name: "ltoaSize", label: "LTOA Size", type: "range", unit: "MWAC", min: 0, max: 100, step: 0.1 },
      { name: "batterySize", label: "Battery Size", type: "range", unit: "Kwh", min: 0, max: 1000, step: 10 },
      { name: "electrolyzerSize", label: "Electrolyser Size", type: "range", unit: "MWEL-AC", min: 0, max: 100, step: 0.1 }
    ]
  },
  {
    title: "Storage & Compression",
    description: "Storage and compression system configuration",
    variables: [
      { name: "lowBarStorage", label: "Low Bar H2 Storage Size", type: "range", unit: "Peak NM3", min: 0, max: 10000, step: 100 },
      { name: "highBarStorage", label: "High Bar H2 Storage Size", type: "range", unit: "Peak NM3", min: 0, max: 10000, step: 100 },
      { name: "h2Compressor", label: "H2 Compressor Throughput", type: "range", unit: "NM3/hr", min: 0, max: 1000, step: 10 },
      { name: "o2Storage", label: "O2 Storage Size", type: "range", unit: "Peak NM3", min: 0, max: 10000, step: 100 },
      { name: "o2Compressor", label: "O2 Compressor Throughput", type: "range", unit: "NM3/hr", min: 0, max: 1000, step: 10 }
    ]
  }
]

export function VariablesForm() {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const renderVariableInput = (variable: VariableGroup['variables'][0]) => {
    switch (variable.type) {
      case 'number':
        return (
          <Input
            type="number"
            id={variable.name}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.label}`}
          />
        )
      case 'select':
        return (
          <Select onValueChange={(value) => handleInputChange(variable.name, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${variable.label}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'switch':
        return (
          <Switch
            id={variable.name}
            onCheckedChange={(checked) => handleInputChange(variable.name, checked)}
          />
        )
      case 'range':
        return (
          <div className="flex gap-4">
            <Input
              type="number"
              id={`${variable.name}Min`}
              min={variable.min}
              max={variable.max}
              step={variable.step}
              onChange={(e) => handleInputChange(`${variable.name}Min`, e.target.value)}
              placeholder="Min"
            />
            <Input
              type="number"
              id={`${variable.name}Max`}
              min={variable.min}
              max={variable.max}
              step={variable.step}
              onChange={(e) => handleInputChange(`${variable.name}Max`, e.target.value)}
              placeholder="Max"
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="grid gap-6 p-6">
      {variableGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">{group.description}</p>
            <div className="grid gap-4">
              {group.variables.map((variable) => (
                <div key={variable.name} className="grid gap-2">
                  <Label htmlFor={variable.name}>
                    {variable.label}
                    {variable.unit && <span className="text-sm text-gray-500 ml-1">({variable.unit})</span>}
                  </Label>
                  {renderVariableInput(variable)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 