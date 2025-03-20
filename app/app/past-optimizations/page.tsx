'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@../../components/ui/popover";
import { withAuth } from '../../form/authWrapper';
import { useState, useEffect } from 'react';

interface OptimizationResult {
  created_at: string;
  status: string;
  updated_at: string;
  operation_run_id: string;
}

interface OptimizedVariables {
  BES_size_KWH?: number;
  EL_size_MW?: number;
  H2_compressor_NM3?: number;
  H2_compressor_prestart_NM3?: number;
  H2_storagesize_NM3?: number;
  H2_storagesize_NM3_highbar?: number;
  LTOA_size_MW?: number;
  O2_compressor_NM3?: number;
  O2_compressor_prestart_NM3?: number;
  O2_storagesize_NM3?: number;
  POWEREVAC_size_MW?: number;
  PVINVERTER_size_MW?: number;
  PV_size_MW?: number;
  WTG_size_MW?: number;
}

interface DetailedOptimization {
  created_at: string;
  operation_run_id: string;
  optimised_variables: {
    BES_size_KWH: number;
    EL_size_MW: number;
    H2_compressor_NM3: number;
    H2_compressor_prestart_NM3: number;
    H2_storagesize_NM3: number;
    H2_storagesize_NM3_highbar: number;
    LTOA_size_MW: number;
    O2_compressor_NM3: number;
    O2_compressor_prestart_NM3: number;
    O2_storagesize_NM3: number;
    POWEREVAC_size_MW: number;
    PVINVERTER_size_MW: number;
    PV_size_MW: number;
    WTG_size_MW: number;
  };
  status: string;
  ui_variables: Record<string, string>;
  updated_at: string;
}

const PastOptimizationsPage = () => {
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [selectedOptimization, setSelectedOptimization] = useState<DetailedOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);

  const fetchOptimizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('https://proposal.hygenco.in/api/getOptimize', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Expected an array of optimization results.');
      }

      setOptimizationResults(data);
    } catch (error) {
      console.error('Error fetching optimizations:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setOptimizationResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizations();
  }, []);

  const fetchOptimizationDetails = async (operationRunId: string) => {
    try {
      const response = await fetch(`https://proposal.hygenco.in/api/detailedOptimise/${operationRunId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedOptimization(data as DetailedOptimization);
    } catch (error) {
      console.error('Error fetching optimization details:', error);
      setSelectedOptimization(null);
    }
  };

  const downloadExcel = async (operationRunId: string) => {
    if (downloadingIds.includes(operationRunId)) return;
    
    try {
      setDownloadingIds(prev => [...prev, operationRunId]);
      
      const response = await fetch(`https://proposal.hygenco.in/api/downloadExcel/${operationRunId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimization-${operationRunId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading excel:', error);
      // You might want to show an error toast here
    } finally {
      setDownloadingIds(prev => prev.filter(id => id !== operationRunId));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Past Optimizations</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchOptimizations}
          >
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-green-800"></div>
          <span className="ml-3">Loading optimizations...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="border border-green-300">
            <TableHeader className="bg-green-100">
              <TableRow className="border-b border-green-300">
                <TableHead className="p-4">ID</TableHead>
                <TableHead className="p-4">Created</TableHead>
                <TableHead className="p-4">Updated</TableHead>
                <TableHead className="p-4">Status</TableHead>
                <TableHead className="p-4">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optimizationResults.map((result) => (
                <Popover key={result.operation_run_id}>
                  <PopoverTrigger asChild>
                    <TableRow 
                      className="border-b border-green-300 hover:bg-green-200 transition cursor-pointer"
                      onClick={() => fetchOptimizationDetails(result.operation_run_id)}
                    >
                      <TableCell className="p-4">{result.operation_run_id}</TableCell>
                      <TableCell className="p-4">{formatDate(result.created_at)}</TableCell>
                      <TableCell className="p-4">{formatDate(result.updated_at)}</TableCell>
                      <TableCell className="p-4">
                        <span className={`px-3 py-1 rounded-full ${
                          result.status?.toLowerCase() === 'failed' 
                            ? 'bg-red-100 text-red-800'
                            : result.status?.toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {result.status || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        {result.status?.toLowerCase() === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadExcel(result.operation_run_id);
                            }}
                            disabled={downloadingIds.includes(result.operation_run_id)}
                          >
                            {downloadingIds.includes(result.operation_run_id) ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-green-800" />
                            ) : (
                              <svg
                                className="h-5 w-5 text-green-800"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  </PopoverTrigger>
                  {selectedOptimization?.operation_run_id === result.operation_run_id && (
                    <PopoverContent 
                      className="w-[800px] bg-white border-2 border-black rounded-lg shadow-lg max-h-[80vh] overflow-y-auto mr-8" 
                      align="center" 
                      sideOffset={20}
                    >
                      <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="text-lg font-semibold">Optimization Details</h3>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0" 
                            onClick={() => setSelectedOptimization(null)}
                          >
                            ✕
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium text-sm text-gray-500 mb-2">Basic Information</h4>
                            <Table className="border border-gray-200">
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium bg-gray-50 w-1/3">Operation ID</TableCell>
                                  <TableCell>{selectedOptimization.operation_run_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium bg-gray-50">Status</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                      selectedOptimization.status?.toLowerCase() === 'failed' 
                                        ? 'bg-red-100 text-red-800'
                                        : selectedOptimization.status?.toLowerCase() === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {selectedOptimization.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium bg-gray-50">Created</TableCell>
                                  <TableCell>{formatDate(selectedOptimization.created_at)}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium bg-gray-50">Updated</TableCell>
                                  <TableCell>{formatDate(selectedOptimization.updated_at)}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          {selectedOptimization.optimised_variables && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-2">Optimized Variables</h4>
                              <Table className="border border-gray-200">
                                <TableBody>
                                  {Object.entries(selectedOptimization.optimised_variables).map(([key, value]) => (
                                    <TableRow key={key}>
                                      <TableCell className="font-medium bg-gray-50 w-1/3">{key}</TableCell>
                                      <TableCell>{value}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}

                          {selectedOptimization.ui_variables && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-2">UI Variables</h4>
                              <Table className="border border-gray-200">
                                <TableBody>
                                  {Object.entries(selectedOptimization.ui_variables).map(([key, value]) => (
                                    <TableRow key={key}>
                                      <TableCell className="font-medium bg-gray-50 w-1/3">{key}</TableCell>
                                      <TableCell>{value}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {optimizationResults.length === 0 && !isLoading && !error && (
        <div className="text-center py-10 text-gray-500">
          No optimization results available.
        </div>
      )}
    </div>
  );
};

export default withAuth(PastOptimizationsPage);
