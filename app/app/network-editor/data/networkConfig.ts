export const networkConfig = {
  "nodes": [
    {
      "id": "renewable_energy-1",
      "type": "moduleNode",
      "position": { "x": 50, "y": 50 },
      "data": {
        "id": "renewable_energy-1",
        "label": "Renewable Energy 1",
        "type": "renewable_energy",
        "description": "Solar and wind power generation",
        "inputPorts": [
          { "id": "latitude", "name": "Latitude", "dataType": "location", "unit": "degrees", "description": "Site latitude", "isRequired": true },
          { "id": "longitude", "name": "Longitude", "dataType": "location", "unit": "degrees", "description": "Site longitude", "isRequired": true }
        ],
        "outputPorts": [
          { "id": "pv_power", "name": "PV Power", "dataType": "power", "unit": "MW", "description": "Solar power generation" },
          { "id": "wind_power", "name": "Wind Power", "dataType": "power", "unit": "MW", "description": "Wind power generation" },
          { "id": "total_power", "name": "Total Power", "dataType": "power", "unit": "MW", "description": "Combined power generation" }
        ],
        "parameters": { "pv_capacity_mw": 10.0, "wind_capacity_mw": 5.0, "use_api": true, "pv_efficiency": 0.85, "wind_efficiency": 0.9 }
      }
    },
    {
      "id": "electrolyzer-1",
      "type": "moduleNode",
      "position": { "x": 300, "y": 50 },
      "data": {
        "id": "electrolyzer-1",
        "label": "Electrolyzer 1",
        "type": "electrolyzer",
        "description": "Hydrogen production system",
        "inputPorts": [
          { "id": "power_input", "name": "Power Input", "dataType": "power", "unit": "MW", "description": "Power input for hydrogen production" }
        ],
        "outputPorts": [
          { "id": "h2_output", "name": "H₂ Output", "dataType": "hydrogen", "unit": "NM³/h", "description": "Hydrogen production rate" },
          { "id": "o2_output", "name": "O₂ Output", "dataType": "oxygen", "unit": "NM³/h", "description": "Oxygen production rate" },
          { "id": "power_consumed", "name": "Power Consumed", "dataType": "power", "unit": "MW", "description": "Actual power consumed" },
          { "id": "efficiency", "name": "Efficiency", "dataType": "percentage", "unit": "%", "description": "Current operating efficiency" }
        ],
        "parameters": { "capacity_mw": 8.0, "min_load_percentage": 0.2, "max_load_percentage": 1.0, "base_efficiency": 0.7, "h2_production_rate_nm3_per_mwh": 210.0, "o2_production_rate_nm3_per_mwh": 105.0 }
      }
    },
    {
      "id": "hydrogen_storage-1",
      "type": "moduleNode",
      "position": { "x": 550, "y": 50 },
      "data": {
        "id": "hydrogen_storage-1",
        "label": "Hydrogen Storage 1",
        "type": "hydrogen_storage",
        "description": "Hydrogen storage system",
        "inputPorts": [
          { "id": "h2_input", "name": "H₂ Input", "dataType": "hydrogen", "unit": "NM³/h", "description": "Hydrogen input flow rate" },
          { "id": "h2_output_request", "name": "H₂ Output Request", "dataType": "hydrogen", "unit": "NM³/h", "description": "Requested hydrogen output flow rate" }
        ],
        "outputPorts": [
          { "id": "h2_output", "name": "H₂ Output", "dataType": "hydrogen", "unit": "NM³/h", "description": "Actual hydrogen output flow rate" },
          { "id": "h2_excess", "name": "H₂ Excess", "dataType": "hydrogen", "unit": "NM³/h", "description": "Excess hydrogen that could not be stored" },
          { "id": "h2_shortfall", "name": "H₂ Shortfall", "dataType": "hydrogen", "unit": "NM³/h", "description": "Hydrogen shortfall that could not be supplied" },
          { "id": "soc", "name": "State of Charge", "dataType": "percentage", "unit": "%", "description": "Current state of charge" }
        ],
        "parameters": { "capacity_nm3": 10000.0, "initial_soc": 0.2, "min_soc": 0.05, "max_soc": 0.95, "max_fill_rate_nm3_per_hour": 200.0, "max_empty_rate_nm3_per_hour": 200.0, "leakage_rate": 0.001 }
      }
    },
    {
      "id": "client_delivery-1",
      "type": "moduleNode",
      "position": { "x": 800, "y": 50 },
      "data": {
        "id": "client_delivery-1",
        "label": "Client Delivery 1",
        "type": "client_delivery",
        "description": "Client delivery management",
        "inputPorts": [
          { "id": "h2_available", "name": "H₂ Available", "dataType": "hydrogen", "unit": "NM³/h", "description": "Available hydrogen for delivery" },
          { "id": "o2_available", "name": "O₂ Available", "dataType": "oxygen", "unit": "NM³/h", "description": "Available oxygen for delivery" }
        ],
        "outputPorts": [
          { "id": "h2_delivered", "name": "H₂ Delivered", "dataType": "hydrogen", "unit": "NM³/h", "description": "Hydrogen delivered to clients" },
          { "id": "o2_delivered", "name": "O₂ Delivered", "dataType": "oxygen", "unit": "NM³/h", "description": "Oxygen delivered to clients" },
          { "id": "h2_revenue", "name": "H₂ Revenue", "dataType": "cost", "unit": "currency/h", "description": "Revenue from hydrogen sales" },
          { "id": "o2_revenue", "name": "O₂ Revenue", "dataType": "cost", "unit": "currency/h", "description": "Revenue from oxygen sales" },
          { "id": "net_revenue", "name": "Net Revenue", "dataType": "cost", "unit": "currency/h", "description": "Total revenue from all sales" }
        ],
        "parameters": { "h2_contract_rate": 50.0, "h2_contract_price": 3.5, "o2_contract_rate": 25.0, "o2_contract_price": 0.8, "h2_spot_price": 2.8, "o2_spot_price": 0.5, "delivery_cost_per_nm3": 0.1 }
      }
    }
  ],
  "edges": [
    {
      "id": "e-renewable_energy-1-total_power-electrolyzer-1-power_input",
      "source": "renewable_energy-1",
      "target": "electrolyzer-1",
      "sourceHandle": "output-total_power",
      "targetHandle": "input-power_input",
      "data": { "sourcePortId": "total_power", "targetPortId": "power_input", "dataType": "power" },
      "animated": true,
      "style": { "stroke": "#ff9800" }
    },
    {
      "id": "e-electrolyzer-1-h2_output-hydrogen_storage-1-h2_input",
      "source": "electrolyzer-1",
      "target": "hydrogen_storage-1",
      "sourceHandle": "output-h2_output",
      "targetHandle": "input-h2_input",
      "data": { "sourcePortId": "h2_output", "targetPortId": "h2_input", "dataType": "hydrogen" },
      "animated": true,
      "style": { "stroke": "#2196f3" }
    },
    {
      "id": "e-hydrogen_storage-1-h2_output-client_delivery-1-h2_available",
      "source": "hydrogen_storage-1",
      "target": "client_delivery-1",
      "sourceHandle": "output-h2_output",
      "targetHandle": "input-h2_available",
      "data": { "sourcePortId": "h2_output", "targetPortId": "h2_available", "dataType": "hydrogen" },
      "animated": true,
      "style": { "stroke": "#2196f3" }
    }
  ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
};
