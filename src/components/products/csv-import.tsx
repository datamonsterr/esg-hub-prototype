'use client';

import { useState } from 'react';
import { X, Upload, Download, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert } from '../ui/alert';

interface CSVImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVImport({ onClose, onSuccess }: CSVImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      // Here we would integrate with react-spreadsheet-import
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSuccess();
    } catch (error) {
      console.error('Failed to process CSV:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    // Create and download CSV template
    const headers = ['name', 'sku', 'description', 'category', 'brand', 'originCountry'];
    const csvContent = headers.join(',') + '\n' + 
                      'Running Shoe,RS-001,High-performance running shoe,footwear,Nike,Vietnam';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Import Products from CSV</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Template Download */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">
                <h4 className="font-medium">Need a template?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Download our CSV template to ensure your data is in the correct format.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 flex items-center space-x-2"
                  onClick={downloadTemplate}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </Button>
              </div>
            </Alert>

            {/* File Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${
                selectedFile ? 'text-green-500' : 'text-gray-400'
              }`} />
              
              {selectedFile ? (
                <div>
                  <p className="text-lg font-medium text-green-700 mb-2">
                    File selected: {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your CSV file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports CSV files up to 10MB
                  </p>
                </div>
              )}
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="mt-4" asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Processing CSV file...</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleProcess}
                disabled={!selectedFile || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Import Products'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 