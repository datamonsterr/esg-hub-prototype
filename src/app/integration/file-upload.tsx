"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, ArrowLeft, File as FileIcon, X } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faFilePdf,
  faFileCsv,
  faFileExcel,
  faFileWord,
  faFileImage,
  faFile,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { useGetFileUpload, useGetActivityStatus, createDocument } from '@/src/api/integration';
import { GlobalLoading } from '@/src/components/global-loading';
import { FileType } from '@/src/types';
import { ErrorComponent } from '@/src/components/ui/error';
import { useToast } from '@/src/hooks/use-toast';
import { ComingSoonModal } from "@/src/components/coming-soon-modal"
import { endpoints } from '@/src/api/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog"
import { useRouter, useSearchParams } from "next/navigation"
import { v4 as uuidv4 } from 'uuid';
import { createActivity } from "@/src/api/management"
import { Product } from '@/src/types';

interface FileUploadProps {
  selectedProduct: Product | null
  onNavigateBack: () => void
  onUploadComplete: (docId: string) => void
}

export function FileUpload({ selectedProduct, onNavigateBack, onUploadComplete }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fileUpload, isLoading, isError } = useGetFileUpload();
  const { showErrorToast, showSuccessToast } = useToast();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<FileType | null>(null);
  const [uploadingActivityId, setUploadingActivityId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const { activity: uploadingActivity, isLoading: isStatusLoading } = useGetActivityStatus(uploadingActivityId);

  const onNavigateToValidation = (activityId: string) => {
    router.push(`/integration/validation/${activityId}`);
  };

  useEffect(() => {
    if (uploadingActivity?.status === 'success') {
      showSuccessToast("File processed successfully! You can now review and validate the extracted data.");
    }
  }, [uploadingActivity, showSuccessToast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setUploadedFile(e.dataTransfer.files[0]);
        if (isUploadModalOpen) {
          setIsUploadModalOpen(false);
        }
      }
    },
    [isUploadModalOpen]
  );

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (isError) {
    return <ErrorComponent title="Error Loading Data" description="There was an error loading the file upload data. Please try again later." />;
  }

  if (!fileUpload) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      if (isUploadModalOpen) {
        setIsUploadModalOpen(false);
      }
    }
  };

  const handleStartUpload = async () => {
    if (!uploadedFile) {
      showErrorToast("Please select a file to upload first.")
      return
    }
    try {
      const newActivityId = uuidv4();
      const fileExtension = uploadedFile.name.split('.').pop() || '';

      await createDocument(endpoints.documents.processed, {
        arg: { id: newActivityId, fileName: uploadedFile.name, fileExtension },
      });

      const newActivity = await createActivity(endpoints.integration.activities, {
        arg: {
          id: newActivityId,
          title: 'File Upload',
          subtitle: uploadedFile.name,
        }
      });
      
      // Upload the file with the same UUID
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('id', newActivityId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }
      setUploadingActivityId(newActivity.id);
      showSuccessToast("Upload started, processing file...");
      // The useGetActivityStatus hook will now monitor the status
      onUploadComplete(newActivity.id);
    } catch (error) {
      console.error('Upload failed:', error);
      showErrorToast("Failed to start upload process.");
    }
  }

  const handleCardClick = (type: FileType) => {
    if (type.id === 'multiple') {
      setIsComingSoonModalOpen(true);
    } else {
      setSelectedFileType(type);
      setIsUploadModalOpen(true);
    }
  };

  const getIconForFile = (file: File) => {
    if (file.type.startsWith('image')) return faFileImage;
    if (file.name.endsWith('.pdf')) return faFilePdf;
    if (file.name.endsWith('.csv')) return faFileCsv;
    if (/[.]xls[x]?$/i.test(file.name)) return faFileExcel;
    if (/[.]docx?$/i.test(file.name)) return faFileWord;
    return faFile;
  };

  const getIconFromFileType = (icon: string) => {
    switch (icon) {
      case 'faFileExcel':
        return faFileExcel;
      case 'faFileCsv':
        return faFileCsv;
      case 'faFilePdf':
        return faFilePdf;
      case 'faFileWord':
        return faFileWord;
      case 'faFileImage':
        return faFileImage;
      case 'faFile':
        return faFile;
      default:
        return faFile;
    }
  };

  const fileTypeAccept = {
    excel: ".xlsx,.xls",
    csv: ".csv",
    pdf: ".pdf",
    word: ".doc,.docx",
    images: "image/*",
    multiple: "*/*"
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex-1 space-y-8 px-8 pt-8 pb-8">
        {/* How it works */}
        <Alert className="bg-blue-50 border-blue-200 rounded-brand">
          <AlertDescription>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1 ml-4">
                <li>• Upload your files and our AI will automatically extract ESG-related information</li>
                <li>• Review the extracted data and make corrections if needed</li>
                <li>• Provide feedback to help improve our AI accuracy</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* File Type Selection */}
        <div>
          <h2 className="text-xl font-medium mb-6">Choose File Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fileUpload.fileTypes.map((type: FileType) => (
              <Card
                key={type.id}
                className="cursor-pointer transition-all rounded-brand border-border-light hover:shadow-md bg-white"
                onClick={() => handleCardClick(type)}
              >
                <CardContent className="p-6 text-center">
                  <FontAwesomeIcon icon={getIconFromFileType(type.icon)} className={`text-3xl mb-3 ${type.iconColor}`} />
                  <h3 className="font-medium mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${type.badgeColor}`}>
                    {type.badge}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        {!uploadedFile && (
          <div
            className={`border-2 border-dashed rounded-brand p-12 text-center transition-colors ${
              dragActive ? "border-brand-primary bg-brand-primary/5" : "border-border-light hover:border-brand-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-brand-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Drag and drop your file here</h3>
            <p className="text-gray-600 mb-6">or click to browse and select a file from your computer</p>

            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              ref={fileInputRef}
            />
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              Maximum file size: 100MB
            </p>
          </div>
        )}

        {/* Uploaded File Info */}
        {uploadedFile && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">Uploaded File</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-brand">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={getIconForFile(uploadedFile)} className="text-gray-500 text-lg" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedFile(null);
                  setUploadingActivityId(null);
                }}
              >
                Remove
              </Button>
            </div>
            {uploadingActivity && (
               <div className="flex items-center space-x-2 mt-2">
                 <p>Status: {uploadingActivity.status}</p>
                  {uploadingActivity.status === 'processing' && isStatusLoading && <p>(checking...)</p>}
               </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onNavigateBack} className="border-border-light rounded-brand bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="space-x-4">
            <Button variant="outline" className="border-border-light rounded-brand bg-transparent">
              Save as Draft
            </Button>
            <Button onClick={handleStartUpload} className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand" disabled={!!uploadingActivityId}>
              {uploadingActivityId ? 'Processing...' : 'Start Upload'}
            </Button>
            {uploadingActivityId && uploadingActivity?.status === 'success' && (
              <Button
                className="bg-green-600 hover:bg-green-700 rounded-brand"
                onClick={() => onNavigateToValidation(uploadingActivityId)}
              >
                Review & Validate Data
              </Button>
            )}
          </div>
        </div>

        <ComingSoonModal isOpen={isComingSoonModalOpen} onClose={() => setIsComingSoonModalOpen(false)} />
        
        <FileUploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          fileType={selectedFileType}
          onFileSelect={handleFileSelect}
          onDrop={handleDrop}
          dragActive={dragActive}
          handleDrag={handleDrag}
        />
      </div>
    </div>
  )
}

function FileUploadModal({ 
  isOpen, 
  onClose, 
  fileType, 
  onFileSelect, 
  onDrop,
  dragActive,
  handleDrag,
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  fileType: FileType | null, 
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onDrop: (e: React.DragEvent) => void,
  dragActive: boolean,
  handleDrag: (e: React.DragEvent) => void,
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileTypeAccept = {
    excel: ".xlsx,.xls",
    csv: ".csv",
    pdf: ".pdf",
    word: ".doc,.docx",
    images: "image/*",
    multiple: "*/*"
  };

  if (!fileType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={onDrop}
      >
        <DialogHeader>
          <DialogTitle>Upload {fileType.title}</DialogTitle>
        </DialogHeader>
        <div
          className={`border-2 border-dashed rounded-brand p-12 text-center transition-colors ${
            dragActive ? "border-brand-primary bg-brand-primary/5" : "border-border-light hover:border-brand-primary/50"
          }`}
        >
          <Upload className="h-12 w-12 text-brand-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Drag and drop your file here</h3>
          <p className="text-gray-600 mb-6">or click to browse and select a file</p>
          <input
            type="file"
            onChange={onFileSelect}
            className="hidden"
            ref={fileInputRef}
            accept={fileTypeAccept[fileType.id as keyof typeof fileTypeAccept]}
          />
          <Button
            className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
