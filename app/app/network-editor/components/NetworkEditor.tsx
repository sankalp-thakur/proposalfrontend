"use client"

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/editor.css';

const ModuleNode = dynamic(() => import('./ModuleNode'), { ssr: false });
const ModuleSidebar = dynamic(() => import('./ModuleSidebar'), { ssr: false });
const PropertiesPanel = dynamic(() => import('./PropertiesPanel'), { ssr: false });

import { moduleDefinitions } from '../data/moduleDefinitions';

const nodeTypes: NodeTypes = {
  moduleNode: ModuleNode,
};

interface NetworkEditorProps {
  onConfigChange?: (config: any) => void;
}

export interface NetworkEditorRef {
  getCurrentFlow: () => any | null;
}

const NetworkEditor = forwardRef<NetworkEditorRef, NetworkEditorProps>(({ onConfigChange }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);

  useImperativeHandle(ref, () => ({
    getCurrentFlow: () => {
      if (reactFlowInstance) {
        return reactFlowInstance.toObject();
      }
      return null;
    }
  }));

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);
      
      if (!sourceNode || !targetNode) return;
      
      const sourcePort = sourceNode.data.outputPorts.find(
        (port: any) => `output-${port.id}` === connection.sourceHandle
      );
      const targetPort = targetNode.data.inputPorts.find(
        (port: any) => `input-${port.id}` === connection.targetHandle
      );
      
      if (!sourcePort || !targetPort) return;
      
      if (sourcePort.dataType === targetPort.dataType) {
        const edge = {
          ...connection,
          id: `e${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
          data: {
            sourcePortId: sourcePort.id,
            targetPortId: targetPort.id,
            dataType: sourcePort.dataType,
          },
          animated: true,
          style: { stroke: getPortColor(sourcePort.dataType) },
        };
        
        setEdges((eds) => addEdge(edge, eds));
      } else {
        alert(`Incompatible port types: ${sourcePort.dataType} cannot connect to ${targetPort.dataType}`);
      }
    },
    [nodes, setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const moduleType = event.dataTransfer.getData('application/reactflow');
        
        if (!moduleType || !moduleDefinitions[moduleType]) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const id = `${moduleType}-${Date.now()}`;
        
        const newNode: Node = {
          id,
          type: 'moduleNode',
          position,
          data: {
            ...moduleDefinitions[moduleType],
            id,
            label: `${moduleDefinitions[moduleType].label} ${nodes.filter(n => n.data.type === moduleType).length + 1}`,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes, nodes]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onElementClick = useCallback(
    (event: React.MouseEvent, element: Node | Edge) => {
      setSelectedElement(element);
    },
    []
  );

  const onParameterChange = useCallback(
    (nodeId: string, paramName: string, value: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                parameters: {
                  ...node.data.parameters,
                  [paramName]: value,
                },
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const saveNetwork = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem('gh2-network', JSON.stringify(flow));
      
      if (onConfigChange) {
        onConfigChange(flow);
      }
      
      alert('Network configuration saved successfully!');
    }
  }, [reactFlowInstance, onConfigChange]);

  const loadNetwork = useCallback(() => {
    const savedFlow = localStorage.getItem('gh2-network');
    if (savedFlow) {
      const flow = JSON.parse(savedFlow);
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      alert('Network configuration loaded successfully!');
    }
  }, [setNodes, setEdges]);

  const clearNetwork = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the current network?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  return (
    <div className="h-full flex">
      <ModuleSidebar />
      <div className="flex-grow h-full" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            onNodeClick={onElementClick}
            onEdgeClick={onElementClick}
            fitView
          >
            <Background />
            <Controls />
            <Panel position="top-right">
              <div className="flex gap-2">
                <button
                  onClick={saveNetwork}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={loadNetwork}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Load
                </button>
                <button
                  onClick={clearNetwork}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Clear
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      <PropertiesPanel
        selectedElement={selectedElement}
        onParameterChange={onParameterChange}
      />
    </div>
  );
});

// Add display name for better debugging in React DevTools
NetworkEditor.displayName = 'NetworkEditor';

export const getPortColor = (dataType: string): string => {
  switch (dataType) {
    case 'power':
      return '#ff9800';
    case 'hydrogen':
      return '#2196f3';
    case 'oxygen':
      return '#4caf50';
    case 'percentage':
      return '#9c27b0';
    default:
      return '#555';
  }
};

export default NetworkEditor;
