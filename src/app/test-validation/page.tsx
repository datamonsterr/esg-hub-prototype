import { KeyHighlights } from '@/src/components/validation/key-highlights';
import { DocumentSummary } from '@/src/components/validation/document-summary';
import { FilePreview } from '@/src/components/validation/file-preview';
import { Actors } from '@/src/components/validation/actors';
import { Actions } from '@/src/components/validation/actions';
import { DynamicTable } from '@/src/components/ui/dynamic-table';
import { useGetDynamicTable } from '@/src/api/integration';

export default function TestValidationPage() {
  // Test document ID - you can change this to test different IDs
  const testDocumentId = "test-doc-123";
  
  const { dynamicTable, isLoading: tableLoading, isError: tableError } = useGetDynamicTable(testDocumentId);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Mock API Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">File Preview</h2>
          <FilePreview contentUrl={`/file-previews/${testDocumentId}`} />
        </div>

        {/* Key Highlights */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Key Highlights</h2>
          <KeyHighlights contentUrl={`/key-highlights-data/${testDocumentId}`} />
        </div>

        {/* Document Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Document Summary</h2>
          <DocumentSummary 
            contentUrl={`/document-summary/${testDocumentId}`}
            fileName="ESG_Traceability_Report_2024.pdf"
          />
        </div>

        {/* Actors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Document Actors</h2>
          <Actors documentId={testDocumentId} />
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Document Actions</h2>
          <Actions documentId={testDocumentId} />
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dynamic Table</h2>
        {tableLoading && <div>Loading table...</div>}
        {tableError && <div className="text-red-500">Error loading table: {tableError.message}</div>}
        {dynamicTable && (
          <DynamicTable
            title={dynamicTable.title}
            data={dynamicTable.data}
            columns={dynamicTable.columns as any}
          />
        )}
      </div>

      {/* API Endpoint URLs for Reference */}
      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">API Endpoints Created:</h3>
        <ul className="space-y-2 text-sm font-mono">
          <li>• GET /api/file-previews/{testDocumentId}</li>
          <li>• GET /api/key-highlights-data/{testDocumentId}</li>
          <li>• GET /api/document-summary/{testDocumentId}</li>
          <li>• GET /api/document-actors/{testDocumentId}</li>
          <li>• GET /api/document-actions/{testDocumentId}</li>
          <li>• GET /api/document-tables/{testDocumentId}</li>
          <li>• GET /api/processed-documents/{testDocumentId}</li>
          <li>• GET /api/files/{testDocumentId} (PDF placeholder)</li>
        </ul>
      </div>
    </div>
  );
}
