"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
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

const NetworkEditor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [configName, setConfigName] = useState<string>('');
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);
  
  useEffect(() => {
    const loadSavedConfigNames = () => {
      const configs: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('network-config-')) {
          configs.push(key.replace('network-config-', ''));
        }
      }
      setSavedConfigs(configs);
    };
    
    loadSavedConfigNames();
  }, []);

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

  const saveNetworkConfiguration = useCallback((name: string) => {
    if (!reactFlowInstance || !name.trim()) return;
    
    const flow = reactFlowInstance.toObject();
    const config = {
      name,
      modules: flow.nodes,
      connections: flow.edges
    };
    
    try {
      localStorage.setItem(`network-config-${name}`, JSON.stringify(config));
      
      if (!savedConfigs.includes(name)) {
        setSavedConfigs(prev => [...prev, name]);
      }
      
      alert(`Network configuration '${name}' saved successfully!`);
      
      return config;
    } catch (error) {
      console.error('Error saving network configuration:', error);
      alert('Failed to save network configuration');
      return null;
    }
  }, [reactFlowInstance, savedConfigs]);

  const loadNetworkConfiguration = useCallback((name: string) => {
    try {
      const savedConfig = localStorage.getItem(`network-config-${name}`);
      if (!savedConfig) {
        alert(`No configuration found with name '${name}'`);
        return false;
      }
      
      const config = JSON.parse(savedConfig);
      setNodes(config.modules || []);
      setEdges(config.connections || []);
      alert(`Network configuration '${name}' loaded successfully!`);
      return true;
    } catch (error) {
      console.error('Error loading network configuration:', error);
      alert('Failed to load network configuration');
      return false;
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
              <div className="bg-white p-2 rounded shadow-md flex gap-2">
                <input 
                  type="text" 
                  placeholder="Configuration name" 
                  className="px-2 py-1 border rounded text-sm w-40"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                />
                <select
                  className="px-2 py-1 border rounded text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      setConfigName(e.target.value);
                    }
                  }}
                  value=""
                >
                  <option value="">Load saved...</option>
                  {savedConfigs.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button
                  onClick={() => saveNetworkConfiguration(configName)}
                  disabled={!configName.trim()}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-blue-300"
                >
                  Save
                </button>
                <button
                  onClick={() => loadNetworkConfiguration(configName)}
                  disabled={!configName.trim()}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-green-300"
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
};

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
