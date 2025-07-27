"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useGetFilePreview } from "@/src/api/integration"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/src/components/ui/dialog"
import dynamic from 'next/dynamic'
import { endpoints } from "@/src/api/axios"

// Dynamically import react-pdf components with SSR disabled
const Document = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-48 w-full"></div>
})

const Page = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-48 w-full"></div>
})

// Set up PDF.js worker when component mounts
let pdfjs: any;
if (typeof window !== 'undefined') {
  import('react-pdf').then(({ pdfjs: pdfjsLib }) => {
    pdfjs = pdfjsLib;
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  });
}

interface FilePreviewProps {
  documentId: number | undefined
}

export function FilePreview({ documentId }: FilePreviewProps) {
  const { filePreview, isLoading, isError } = useGetFilePreview(documentId)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true)
    
    // Load CSS for react-pdf by adding link tags
    if (typeof window !== 'undefined') {
      const existingAnnotationLink = document.querySelector('link[href*="AnnotationLayer.css"]')
      const existingTextLink = document.querySelector('link[href*="TextLayer.css"]')
      
      if (!existingAnnotationLink) {
        const annotationLink = document.createElement('link')
        annotationLink.rel = 'stylesheet'
        annotationLink.href = 'https://unpkg.com/react-pdf/dist/Page/AnnotationLayer.css'
        document.head.appendChild(annotationLink)
      }
      
      if (!existingTextLink) {
        const textLink = document.createElement('link')
        textLink.rel = 'stylesheet'
        textLink.href = 'https://unpkg.com/react-pdf/dist/Page/TextLayer.css'
        document.head.appendChild(textLink)
      }
    }
  }, [])

  if (isLoading) return <div>Loading file preview...</div>
  if (isError) return <div>Error loading file preview.</div>
  if (!filePreview) return null

  const fileType = filePreview.fileName.split(".").pop()?.toLowerCase()

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  // Construct the actual file URL from documentId
  const getFileUrl = () => {
    if (!documentId) return null;
    return endpoints.documents.validation.filePreview(documentId);
  };

  const fileUrl = getFileUrl();

  const renderContent = () => {
    if (!fileUrl) return <p>File not found.</p>;
    
    switch (fileType) {
      case "pdf":
        if (!isClient) {
          return <div className="animate-pulse bg-gray-200 rounded h-48 w-full"></div>
        }
        return (
          <div>
            <div className="border rounded-lg p-2 cursor-pointer" onClick={() => setIsModalOpen(true)}>
              <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={1} width={200} />
              </Document>
            </div>
            <p className="text-sm text-center mt-2">Page 1 of {numPages}</p>
          </div>
        )
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <Image src={fileUrl} alt="File preview" className="max-w-full h-auto rounded-lg" width={800} height={600} />
      default:
        return <p>Unsupported file type for preview.</p>
    }
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-sm">{filePreview.fileName}</span>
        <span className="text-sm text-gray-500">{filePreview.fileSize}</span>
      </div>
      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-6 rounded-brand">
        <div className="bg-white p-4 rounded shadow-sm">
          {renderContent()}
        </div>
        <p className="text-sm mt-4 text-gray-700">
          This document is the 2024 traceability report of the 200 countries from various authorities, and lists the
          essential data from the supply chain. The report shows comprehensive material sourcing details, supplier
          audit results, certificate validations, and transportation documentation for raw materials and finished
          products.
        </p>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{filePreview.fileName}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="h-full overflow-y-auto">
            {fileUrl && isClient && (
              <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (el, index) => (
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
              </Document>
            )}
            {fileUrl && !isClient && (
              <div className="animate-pulse bg-gray-200 rounded h-96 w-full"></div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 