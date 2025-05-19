import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getPortColor } from './NetworkEditor';

interface Port {
  id: string;
  name: string;
  dataType: string;
  unit: string;
  description: string;
  isRequired?: boolean;
}

interface ModuleData {
  id: string;
  type: string;
  label: string;
  description: string;
  inputPorts: Port[];
  outputPorts: Port[];
  parameters: Record<string, any>;
}

const ModuleNode: React.FC<NodeProps<ModuleData>> = ({ data }) => {
  return (
    <div className="module-node">
      <div className="module-header">
        <span>{data.label}</span>
      </div>
      
      <div className="ports-container">
        <div className="input-ports">
          {data.inputPorts.map((port) => (
            <div key={`input-${port.id}`} className="port">
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${port.id}`}
                className={`react-flow__handle-${port.dataType}`}
                style={{ background: getPortColor(port.dataType) }}
              />
              <span className="port-label">{port.name}</span>
              <span className="port-type">{port.unit}</span>
            </div>
          ))}
        </div>
        
        <div className="output-ports">
          {data.outputPorts.map((port) => (
            <div key={`output-${port.id}`} className="port">
              <span className="port-label">{port.name}</span>
              <span className="port-type">{port.unit}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`output-${port.id}`}
                className={`react-flow__handle-${port.dataType}`}
                style={{ background: getPortColor(port.dataType) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(ModuleNode);
