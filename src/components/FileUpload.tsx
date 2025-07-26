import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { gcsService, UploadResponse } from '../services/gcsService';

interface FileUploadProps {
  recordId: string;
  onFilesUploaded?: (files: UploadResponse[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: UploadResponse;
}

const FileUpload: React.FC<FileUploadProps> = ({
  recordId,
  onFilesUploaded,
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'],
  maxSizeInMB = 10
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />;
    } else if (file.type.includes('sheet') || file.type.includes('excel')) {
      return <File className="w-6 h-6 text-green-500" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeInMB}MB limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadingFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and prepare files for upload
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('Some files were rejected:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files: File[]) => {
    // Initialize uploading state for each file
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files one by one (you could also do parallel uploads)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileIndex = uploadingFiles.length + i;

      try {
        // Simulate progress updates (in real implementation, you might use XMLHttpRequest for progress)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map((uploadFile, index) => 
              index === fileIndex && uploadFile.status === 'uploading'
                ? { ...uploadFile, progress: Math.min(uploadFile.progress + 10, 90) }
                : uploadFile
            )
          );
        }, 200);

        // Upload the file
        const result = await gcsService.uploadFile(file, recordId);

        clearInterval(progressInterval);

        // Update file status to success
        setUploadingFiles(prev => 
          prev.map((uploadFile, index) => 
            index === fileIndex
              ? { ...uploadFile, progress: 100, status: 'success', result }
              : uploadFile
          )
        );

      } catch (error) {
        // Update file status to error
        setUploadingFiles(prev => 
          prev.map((uploadFile, index) => 
            index === fileIndex
              ? { 
                  ...uploadFile, 
                  progress: 0, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : uploadFile
          )
        );
      }
    }

    // Call callback with successful uploads
    const successfulUploads = uploadingFiles
      .filter(f => f.status === 'success' && f.result)
      .map(f => f.result!);
    
    if (successfulUploads.length > 0 && onFilesUploaded) {
      onFilesUploaded(successfulUploads);
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const retryUpload = (index: number) => {
    const fileToRetry = uploadingFiles[index];
    if (fileToRetry && fileToRetry.status === 'error') {
      uploadFiles([fileToRetry.file]);
      removeFile(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Files to Google Cloud Storage
            </h3>
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: {acceptedTypes.join(', ')} • Max size: {maxSizeInMB}MB • Max files: {maxFiles}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Uploading Files</h4>
          {uploadingFiles.map((uploadFile, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(uploadFile.file)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(uploadFile.file.size)}
                  </span>
                </div>

                {/* Progress Bar */}
                {uploadFile.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadFile.progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Error Message */}
                {uploadFile.status === 'error' && uploadFile.error && (
                  <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                )}

                {/* Success Message */}
                {uploadFile.status === 'success' && (
                  <p className="text-xs text-green-600 mt-1">Upload successful</p>
                )}
              </div>

              {/* Status Icon and Actions */}
              <div className="flex items-center space-x-2">
                {uploadFile.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                
                {uploadFile.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                
                {uploadFile.status === 'error' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <button
                      onClick={() => retryUpload(index)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Retry
                    </button>
                  </>
                )}

                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;