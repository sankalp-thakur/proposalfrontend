import React from 'react';
import { moduleDefinitions } from '../data/moduleDefinitions';

const ModuleSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, moduleType: string) => {
    event.dataTransfer.setData('application/reactflow', moduleType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="module-sidebar w-64">
      <h3 className="text-sm font-bold mb-4">Module Library</h3>
      <p className="text-xs text-gray-500 mb-4">Drag modules onto the canvas to build your network</p>
      
      {Object.entries(moduleDefinitions).map(([type, module]) => (
        <div
          key={type}
          className="module-item"
          onDragStart={(e) => onDragStart(e, type)}
          draggable
        >
          <div className="font-medium text-sm">{module.label}</div>
          <div className="text-xs text-gray-500 mt-1">{module.description}</div>
        </div>
      ))}
    </div>
  );
};

export default ModuleSidebar;
