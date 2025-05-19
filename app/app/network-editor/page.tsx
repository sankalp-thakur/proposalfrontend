"use client"

import React from 'react';
import { withAuth } from '../../form/authWrapper';
import NetworkEditor from './components/NetworkEditor';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NetworkEditorPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>GH2 Network Simulation Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            Design your hydrogen production network by dragging modules onto the canvas and connecting their input/output ports.
            Configure module parameters in the properties panel.
          </p>
          <div className="h-[800px] border rounded-md">
            <NetworkEditor />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(NetworkEditorPage);
