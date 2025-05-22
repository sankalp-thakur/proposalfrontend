"use client"

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
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
import { toast } from 'react-toastify';

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

// Determine the color for a given port data type
export function getPortColor(dataType: string): string {
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
}

const defaultReactFlowState = {
  nodes: [
    {
      id: "renewable_energy-1",
      type: "moduleNode",
      position: { x: 50, y: 50 },
      data: {
        ...moduleDefinitions.renewable_energy,
        id: "renewable_energy-1",
        label: "Renewable Energy 1",
      }
    },
    {
      id: "electrolyzer-1",
      type: "moduleNode",
      position: { x: 300, y: 50 },
      data: {
        ...moduleDefinitions.electrolyzer,
        id: "electrolyzer-1",
        label: "Electrolyzer 1",
      }
    },
    {
      id: "hydrogen_storage-1",
      type: "moduleNode",
      position: { x: 550, y: 50 },
      data: {
        ...moduleDefinitions.hydrogen_storage,
        id: "hydrogen_storage-1",
        label: "Hydrogen Storage 1",
      }
    },
    {
      id: "client_delivery-1",
      type: "moduleNode",
      position: { x: 800, y: 50 },
      data: {
        ...moduleDefinitions.client_delivery,
        id: "client_delivery-1",
        label: "Client Delivery 1",
      }
    }
  ],
  edges: [
    {
      id: "e-renewable_energy-1-total_power-electrolyzer-1-power_input",
      source: "renewable_energy-1",
      target: "electrolyzer-1",
      sourceHandle: "output-total_power",
      targetHandle: "input-power_input",
      data: { sourcePortId: "total_power", targetPortId: "power_input", dataType: "power" },
      animated: true,
      style: { stroke: getPortColor("power") }
    },
    {
      id: "e-electrolyzer-1-h2_output-hydrogen_storage-1-h2_input",
      source: "electrolyzer-1",
      target: "hydrogen_storage-1",
      sourceHandle: "output-h2_output",
      targetHandle: "input-h2_input",
      data: { sourcePortId: "h2_output", targetPortId: "h2_input", dataType: "hydrogen" },
      animated: true,
      style: { stroke: getPortColor("hydrogen") }
    },
    {
      id: "e-hydrogen_storage-1-h2_output-client_delivery-1-h2_available",
      source: "hydrogen_storage-1",
      target: "client_delivery-1",
      sourceHandle: "output-h2_output",
      targetHandle: "input-h2_available",
      data: { sourcePortId: "h2_output", targetPortId: "h2_available", dataType: "hydrogen" },
      animated: true,
      style: { stroke: getPortColor("hydrogen") }
    }
  ],
  viewport: { x: 0, y: 0, zoom: 1 }
};


const NetworkEditor = forwardRef<NetworkEditorRef, NetworkEditorProps>(({ onConfigChange }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultReactFlowState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultReactFlowState.edges);
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

  const loadInitialNetwork = useCallback(() => {
    if (!reactFlowInstance) return;

    const savedFlowString = localStorage.getItem('gh2-network');
    if (savedFlowString) {
      try {
        const savedFlow = JSON.parse(savedFlowString);
        if (savedFlow && savedFlow.nodes && savedFlow.edges) {
          setNodes(savedFlow.nodes);
          setEdges(savedFlow.edges);
          if (savedFlow.viewport) {
            reactFlowInstance.setViewport(savedFlow.viewport);
          } else {
            reactFlowInstance.fitView();
          }
          toast.info('Loaded network from local storage.');
          if (onConfigChange) {
            onConfigChange(savedFlow); 
          }
          return;
        }
      } catch (error) {
        console.error("Error parsing saved network from local storage:", error);
        toast.error("Failed to load network from local storage due to invalid format.");
      }
    }

    // If no valid saved data, load default
    setNodes(defaultReactFlowState.nodes);
    setEdges(defaultReactFlowState.edges);
    reactFlowInstance.setViewport(defaultReactFlowState.viewport);
    reactFlowInstance.fitView(); 
    toast.info('Loaded default network configuration.');
    if (onConfigChange) {
      onConfigChange(defaultReactFlowState);
    }
  }, [reactFlowInstance, setNodes, setEdges, onConfigChange]);
  
  useEffect(() => {
    if (reactFlowInstance) {
      loadInitialNetwork();
    }
  }, [reactFlowInstance, loadInitialNetwork]);

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
      toast.success('Network configuration saved successfully!');
    }
  }, [reactFlowInstance, onConfigChange]);

  const loadNetwork = useCallback(() => {
    const savedFlowString = localStorage.getItem('gh2-network');
    if (savedFlowString) {
      try {
        const flow = JSON.parse(savedFlowString);
        if (flow && flow.nodes && flow.edges) {
          setNodes(flow.nodes);
          setEdges(flow.edges);
          if (flow.viewport && reactFlowInstance) {
            reactFlowInstance.setViewport(flow.viewport);
          } else if (reactFlowInstance) {
            reactFlowInstance.fitView();
          }
          toast.success('Network configuration loaded successfully!');
          if (onConfigChange) {
            onConfigChange(flow);
          }
        } else {
          toast.error('Invalid network format in local storage.');
        }
      } catch (error) {
        console.error("Error parsing saved network from local storage:", error);
        toast.error("Failed to load network from local storage due to invalid format.");
      }
    } else {
      toast.info('No saved network found in local storage.');
    }
  }, [setNodes, setEdges, reactFlowInstance, onConfigChange]);

  const clearNetwork = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the current network? This will also remove it from local storage.')) {
      setNodes([]);
      setEdges([]);
      localStorage.removeItem('gh2-network');
      toast.info('Network cleared.');
      if (reactFlowInstance) {
         // Optionally, reset to default view after clearing
        setNodes(defaultReactFlowState.nodes);
        setEdges(defaultReactFlowState.edges);
        reactFlowInstance.setViewport(defaultReactFlowState.viewport);
        reactFlowInstance.fitView();
        if (onConfigChange) {
          onConfigChange(defaultReactFlowState);
        }
      }
    }
  }, [setNodes, setEdges, reactFlowInstance, onConfigChange]);

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
            // fitView // fitView is handled by loadInitialNetwork or loadNetwork
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

export default NetworkEditor;
