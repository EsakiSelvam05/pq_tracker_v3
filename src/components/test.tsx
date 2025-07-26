import React from 'react';
import FileUpload from './FileUpload';
import FileManager from './FileManager';
import { UploadResponse } from '../services/gcsService';

// Example usage in PQ Entry Form
const PQEntryFormExample = () => {
  const recordId = 'example-record-id';

  const handleFilesUploaded = (files: UploadResponse[]) => {
    console.log('Files uploaded successfully:', files);
    // Update your form state or record with the uploaded file references
  };

  const handleFileDeleted = (fileName: string) => {
    console.log('File deleted:', fileName);
    // Update your form state or record to remove the deleted file reference
  };

  return (
    <div className="space-y-8">
      {/* File Upload Component */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
        <FileUpload
          recordId={recordId}
          onFilesUploaded={handleFilesUploaded}
          maxFiles={5}
          maxSizeInMB={10}
          acceptedTypes={['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
        />
      </div>

      {/* File Manager Component */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Manage Files</h3>
        <FileManager
          recordId={recordId}
          onFileDeleted={handleFileDeleted}
        />
      </div>
    </div>
  );
};

// Example usage in Records View
const RecordsViewExample = () => {
  const record = {
    id: 'example-record-id',
    // ... other record properties
  };

  return (
    <div className="space-y-4">
      {/* Expandable File Manager in Record Card */}
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-semibold mb-2">Record Files</h4>
        <FileManager
          recordId={record.id}
          onFileDeleted={(fileName) => {
            console.log('File deleted from record:', fileName);
            // Refresh records or update state
          }}
        />
      </div>
    </div>
  );
};

export { PQEntryFormExample, RecordsViewExample };