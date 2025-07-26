// Google Cloud Storage service for React frontend
export interface UploadResponse {
  fileName: string;
  originalName: string;
  signedUrl: string;
  publicUrl?: string;
  size: number;
  contentType: string;
}

export interface FileInfo {
  fileName: string;
  originalName: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  signedUrl: string;
}

class GCSService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost for development
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Upload a single file to Google Cloud Storage
   */
  async uploadFile(file: File, recordId: string, description?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recordId', recordId);
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${this.baseUrl}/api/upload/single`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  }

  /**
   * Upload multiple files to Google Cloud Storage
   */
  async uploadMultipleFiles(files: File[], recordId: string): Promise<{ files: UploadResponse[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('recordId', recordId);

    const response = await fetch(`${this.baseUrl}/api/upload/multiple`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload files');
    }

    return response.json();
  }

  /**
   * Get a signed URL for file access
   */
  async getSignedUrl(fileName: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/file/signed-url/${encodeURIComponent(fileName)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get signed URL');
    }

    const data = await response.json();
    return data.signedUrl;
  }

  /**
   * Delete a file from Google Cloud Storage
   */
  async deleteFile(fileName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/file/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete file');
    }
  }

  /**
   * List all files for a specific record
   */
  async listFiles(recordId: string): Promise<FileInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/files/${recordId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list files');
    }

    const data = await response.json();
    return data.files;
  }

  /**
   * Download a file using its signed URL
   */
  async downloadFile(fileName: string, originalName?: string): Promise<void> {
    try {
      const signedUrl = await this.getSignedUrl(fileName);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = originalName || fileName;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * Check if the backend service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gcsService = new GCSService();
export default gcsService;