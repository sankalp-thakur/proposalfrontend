
export const moduleDefinitions = {
  renewable_energy: {
    type: 'renewable_energy',
    label: 'Renewable Energy',
    description: 'Solar and wind power generation',
    inputPorts: [
      {
        id: 'latitude',
        name: 'Latitude',
        dataType: 'location',
        unit: 'degrees',
        description: 'Site latitude',
        isRequired: true
      },
      {
        id: 'longitude',
        name: 'Longitude',
        dataType: 'location',
        unit: 'degrees',
        description: 'Site longitude',
        isRequired: true
      }
    ],
    outputPorts: [
      {
        id: 'pv_power',
        name: 'PV Power',
        dataType: 'power',
        unit: 'MW',
        description: 'Solar power generation'
      },
      {
        id: 'wind_power',
        name: 'Wind Power',
        dataType: 'power',
        unit: 'MW',
        description: 'Wind power generation'
      },
      {
        id: 'total_power',
        name: 'Total Power',
        dataType: 'power',
        unit: 'MW',
        description: 'Combined power generation'
      }
    ],
    parameters: {
      pv_capacity_mw: 10.0,
      wind_capacity_mw: 5.0,
      use_api: true,
      pv_efficiency: 0.85,
      wind_efficiency: 0.9
    }
  },
  
  battery_storage: {
    type: 'battery_storage',
    label: 'Battery Storage',
    description: 'Energy storage system',
    inputPorts: [
      {
        id: 'charge_power',
        name: 'Charge Power',
        dataType: 'power',
        unit: 'MW',
        description: 'Power input for charging'
      },
      {
        id: 'discharge_request',
        name: 'Discharge Request',
        dataType: 'power',
        unit: 'MW',
        description: 'Requested power output'
      }
    ],
    outputPorts: [
      {
        id: 'available_power',
        name: 'Available Power',
        dataType: 'power',
        unit: 'MW',
        description: 'Power available for discharge'
      },
      {
        id: 'actual_discharge',
        name: 'Actual Discharge',
        dataType: 'power',
        unit: 'MW',
        description: 'Actual power discharged'
      },
      {
        id: 'power_shortfall',
        name: 'Power Shortfall',
        dataType: 'power',
        unit: 'MW',
        description: 'Shortfall in requested power'
      },
      {
        id: 'soc',
        name: 'State of Charge',
        dataType: 'percentage',
        unit: '%',
        description: 'Current battery state of charge'
      }
    ],
    parameters: {
      capacity_kwh: 5000.0,
      initial_soc: 0.5,
      min_soc: 0.1,
      max_soc: 0.9,
      charge_efficiency: 0.95,
      discharge_efficiency: 0.95,
      self_discharge_rate: 0.001
    }
  },
  
  electrolyzer: {
    type: 'electrolyzer',
    label: 'Electrolyzer',
    description: 'Hydrogen production system',
    inputPorts: [
      {
        id: 'power_input',
        name: 'Power Input',
        dataType: 'power',
        unit: 'MW',
        description: 'Power input for hydrogen production'
      }
    ],
    outputPorts: [
      {
        id: 'h2_output',
        name: 'H₂ Output',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Hydrogen production rate'
      },
      {
        id: 'o2_output',
        name: 'O₂ Output',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Oxygen production rate'
      },
      {
        id: 'power_consumed',
        name: 'Power Consumed',
        dataType: 'power',
        unit: 'MW',
        description: 'Actual power consumed'
      },
      {
        id: 'efficiency',
        name: 'Efficiency',
        dataType: 'percentage',
        unit: '%',
        description: 'Current operating efficiency'
      }
    ],
    parameters: {
      capacity_mw: 8.0,
      min_load_percentage: 0.2,
      max_load_percentage: 1.0,
      base_efficiency: 0.7,
      h2_production_rate_nm3_per_mwh: 210.0,
      o2_production_rate_nm3_per_mwh: 105.0
    }
  },
  
  hydrogen_storage: {
    type: 'hydrogen_storage',
    label: 'Hydrogen Storage',
    description: 'Hydrogen storage system',
    inputPorts: [
      {
        id: 'h2_input',
        name: 'H₂ Input',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Hydrogen input flow rate'
      },
      {
        id: 'h2_output_request',
        name: 'H₂ Output Request',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Requested hydrogen output flow rate'
      }
    ],
    outputPorts: [
      {
        id: 'h2_output',
        name: 'H₂ Output',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Actual hydrogen output flow rate'
      },
      {
        id: 'h2_excess',
        name: 'H₂ Excess',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Excess hydrogen that could not be stored'
      },
      {
        id: 'h2_shortfall',
        name: 'H₂ Shortfall',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Hydrogen shortfall that could not be supplied'
      },
      {
        id: 'soc',
        name: 'State of Charge',
        dataType: 'percentage',
        unit: '%',
        description: 'Current state of charge'
      }
    ],
    parameters: {
      capacity_nm3: 10000.0,
      initial_soc: 0.2,
      min_soc: 0.05,
      max_soc: 0.95,
      max_fill_rate_nm3_per_hour: 200.0,
      max_empty_rate_nm3_per_hour: 200.0,
      leakage_rate: 0.001
    }
  },
  
  oxygen_storage: {
    type: 'oxygen_storage',
    label: 'Oxygen Storage',
    description: 'Oxygen storage system',
    inputPorts: [
      {
        id: 'o2_input',
        name: 'O₂ Input',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Oxygen input flow rate'
      },
      {
        id: 'o2_output_request',
        name: 'O₂ Output Request',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Requested oxygen output flow rate'
      }
    ],
    outputPorts: [
      {
        id: 'o2_output',
        name: 'O₂ Output',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Actual oxygen output flow rate'
      },
      {
        id: 'o2_vented',
        name: 'O₂ Vented',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Oxygen vented to atmosphere'
      },
      {
        id: 'o2_shortfall',
        name: 'O₂ Shortfall',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Oxygen shortfall that could not be supplied'
      },
      {
        id: 'soc',
        name: 'State of Charge',
        dataType: 'percentage',
        unit: '%',
        description: 'Current state of charge'
      }
    ],
    parameters: {
      capacity_nm3: 5000.0,
      initial_soc: 0.2,
      min_soc: 0.05,
      max_soc: 0.95,
      max_fill_rate_nm3_per_hour: 100.0,
      max_empty_rate_nm3_per_hour: 100.0,
      leakage_rate: 0.001,
      enable_venting: true
    }
  },
  
  grid_interaction: {
    type: 'grid_interaction',
    label: 'Grid Connection',
    description: 'Grid power import/export',
    inputPorts: [
      {
        id: 'power_request',
        name: 'Power Request',
        dataType: 'power',
        unit: 'MW',
        description: 'Requested power from grid'
      },
      {
        id: 'power_export',
        name: 'Power Export',
        dataType: 'power',
        unit: 'MW',
        description: 'Power to export to grid'
      }
    ],
    outputPorts: [
      {
        id: 'power_imported',
        name: 'Power Imported',
        dataType: 'power',
        unit: 'MW',
        description: 'Actual power imported from grid'
      },
      {
        id: 'power_exported',
        name: 'Power Exported',
        dataType: 'power',
        unit: 'MW',
        description: 'Actual power exported to grid'
      },
      {
        id: 'import_cost',
        name: 'Import Cost',
        dataType: 'cost',
        unit: 'currency/h',
        description: 'Cost of imported power'
      },
      {
        id: 'export_revenue',
        name: 'Export Revenue',
        dataType: 'cost',
        unit: 'currency/h',
        description: 'Revenue from exported power'
      }
    ],
    parameters: {
      max_import_mw: 5.0,
      max_export_mw: 5.0,
      import_price_per_mwh: 80.0,
      export_price_per_mwh: 40.0,
      grid_carbon_intensity: 0.5
    }
  },
  
  client_delivery: {
    type: 'client_delivery',
    label: 'Client Delivery',
    description: 'Client delivery management',
    inputPorts: [
      {
        id: 'h2_available',
        name: 'H₂ Available',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Available hydrogen for delivery'
      },
      {
        id: 'o2_available',
        name: 'O₂ Available',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Available oxygen for delivery'
      }
    ],
    outputPorts: [
      {
        id: 'h2_delivered',
        name: 'H₂ Delivered',
        dataType: 'hydrogen',
        unit: 'NM³/h',
        description: 'Hydrogen delivered to clients'
      },
      {
        id: 'o2_delivered',
        name: 'O₂ Delivered',
        dataType: 'oxygen',
        unit: 'NM³/h',
        description: 'Oxygen delivered to clients'
      },
      {
        id: 'h2_revenue',
        name: 'H₂ Revenue',
        dataType: 'cost',
        unit: 'currency/h',
        description: 'Revenue from hydrogen sales'
      },
      {
        id: 'o2_revenue',
        name: 'O₂ Revenue',
        dataType: 'cost',
        unit: 'currency/h',
        description: 'Revenue from oxygen sales'
      },
      {
        id: 'net_revenue',
        name: 'Net Revenue',
        dataType: 'cost',
        unit: 'currency/h',
        description: 'Total revenue from all sales'
      }
    ],
    parameters: {
      h2_contract_rate: 50.0,
      h2_contract_price: 3.5,
      o2_contract_rate: 25.0,
      o2_contract_price: 0.8,
      h2_spot_price: 2.8,
      o2_spot_price: 0.5,
      delivery_cost_per_nm3: 0.1
    }
  }
};
