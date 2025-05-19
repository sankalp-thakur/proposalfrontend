import React from 'react';
import { Node, Edge } from 'reactflow';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertiesPanelProps {
  selectedElement: Node | Edge | null;
  onParameterChange: (nodeId: string, paramName: string, value: any) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onParameterChange,
}) => {
  if (!selectedElement) {
    return (
      <div className="properties-panel w-64">
        <h3>Properties</h3>
        <p className="text-sm text-gray-500">Select a module or connection to view and edit its properties</p>
      </div>
    );
  }

  if ('source' in selectedElement && 'target' in selectedElement) {
    const edge = selectedElement as Edge;
    return (
      <div className="properties-panel w-64">
        <h3>Connection Properties</h3>
        <div className="property-group">
          <div className="property-item">
            <span className="property-label">Source</span>
            <div className="text-sm">{edge.source}</div>
          </div>
          <div className="property-item">
            <span className="property-label">Target</span>
            <div className="text-sm">{edge.target}</div>
          </div>
          {edge.data && (
            <>
              <div className="property-item">
                <span className="property-label">Data Type</span>
                <div className="text-sm">{edge.data.dataType}</div>
              </div>
              <div className="property-item">
                <span className="property-label">Source Port</span>
                <div className="text-sm">{edge.data.sourcePortId}</div>
              </div>
              <div className="property-item">
                <span className="property-label">Target Port</span>
                <div className="text-sm">{edge.data.targetPortId}</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const node = selectedElement as Node;
  const { id, label, type, parameters, inputPorts, outputPorts } = node.data;

  return (
    <div className="properties-panel w-64">
      <h3>Module Properties: {label}</h3>
      
      <div className="property-group">
        <div className="property-group-title">General</div>
        <div className="property-item">
          <Label className="property-label">ID</Label>
          <div className="text-sm">{id}</div>
        </div>
        <div className="property-item">
          <Label className="property-label">Type</Label>
          <div className="text-sm">{type}</div>
        </div>
      </div>
      
      {parameters && Object.keys(parameters).length > 0 && (
        <div className="property-group">
          <div className="property-group-title">Parameters</div>
          {Object.entries(parameters).map(([key, value]) => (
            <div key={key} className="property-item">
              <Label htmlFor={`param-${key}`} className="property-label">
                {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
              </Label>
              <Input
                id={`param-${key}`}
                type={typeof value === 'number' ? 'number' : 'text'}
                value={value as string | number}
                onChange={(e) => {
                  const newValue = e.target.type === 'number' 
                    ? parseFloat(e.target.value) 
                    : e.target.value;
                  onParameterChange(id, key, newValue);
                }}
                className="property-input"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="property-group">
        <div className="property-group-title">Input Ports</div>
        {inputPorts.map((port: any) => (
          <div key={port.id} className="property-item">
            <div className="text-sm font-medium">{port.name}</div>
            <div className="text-xs text-gray-500">
              {port.dataType} ({port.unit})
            </div>
            <div className="text-xs text-gray-500">{port.description}</div>
          </div>
        ))}
      </div>
      
      <div className="property-group">
        <div className="property-group-title">Output Ports</div>
        {outputPorts.map((port: any) => (
          <div key={port.id} className="property-item">
            <div className="text-sm font-medium">{port.name}</div>
            <div className="text-xs text-gray-500">
              {port.dataType} ({port.unit})
            </div>
            <div className="text-xs text-gray-500">{port.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertiesPanel;
