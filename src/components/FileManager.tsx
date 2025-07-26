import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, RefreshCw, FileText, Image, File } from 'lucide-react';
import { gcsService, FileInfo } from '../services/gcsService';

interface FileManagerProps {
  recordId: string;
  onFileDeleted?: (fileName: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ recordId, onFileDeleted }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await gcsService.listFiles(recordId);
      setFiles(fileList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) {
      loadFiles();
    }
  }, [recordId]);

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (contentType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (contentType.includes('sheet') || contentType.includes('excel')) {
      return <File className="w-5 h-5 text-green-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      await gcsService.downloadFile(file.fileName, file.originalName);
    } catch (error) {
      alert('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (file: FileInfo) => {
    if (!window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return;
    }

    try {
      await gcsService.deleteFile(file.fileName);
      setFiles(prev => prev.filter(f => f.fileName !== file.fileName));
      onFileDeleted?.(file.fileName);
    } catch (error) {
      alert('Failed to delete file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handlePreview = (file: FileInfo) => {
    // Open file in new tab using signed URL
    window.open(file.signedUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600 mb-2">Error loading files: {error}</p>
        <button
          onClick={loadFiles}
          className="text-sm text-red-700 hover:text-red-900 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Uploaded Files ({files.length})
        </h3>
        <button
          onClick={loadFiles}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          title="Refresh files"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={file.fileName}
            className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200"
          >
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(file.contentType)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <span className="text-xs text-gray-500">
                  {formatFileSize(parseInt(file.size.toString()))}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{file.contentType}</span>
                {file.uploadedAt && (
                  <span>
                    Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePreview(file)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Preview file"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleDownload(file)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleDelete(file)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;