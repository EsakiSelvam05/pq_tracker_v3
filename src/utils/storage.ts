import { PQRecord } from '../types';

const STORAGE_KEY = 'pq_records';
const FILES_STORAGE_KEY = 'pq_files';

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to convert base64 to Blob
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// Store file data separately
const saveFileData = async (recordId: string, files: File[]): Promise<void> => {
  try {
    const filesData = _getAllStoredFilesData();
    
    // Convert all files to base64 and store as array
    const fileDataArray = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        data: await fileToBase64(file)
      }))
    );
    
    filesData[recordId] = fileDataArray;
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(filesData));
  } catch (error) {
    console.error('Error saving file data:', error);
  }
};

// Get file data
const _getAllStoredFilesData = (): Record<string, any> => {
  const stored = localStorage.getItem(FILES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Get files data for a specific record
const getFilesDataForRecord = (recordId: string): any[] => {
  const filesData = _getAllStoredFilesData();
  return filesData[recordId] || [];
};

// Get file as Blob
export const getFileAsBlob = (recordId: string, fileIndex: number): Blob | null => {
  try {
    const filesArray = getFilesDataForRecord(recordId);
    const fileData = filesArray[fileIndex];
    if (!fileData) return null;
    
    return base64ToBlob(fileData.data, fileData.type);
  } catch (error) {
    console.error('Error retrieving file data:', error);
    return null;
  }
};

// Get file info
export const getFileInfo = (recordId: string, fileIndex: number): { name: string; type: string; size: number } | null => {
  try {
    const filesArray = getFilesDataForRecord(recordId);
    const fileData = filesArray[fileIndex];
    if (!fileData) return null;
    
    return {
      name: fileData.name,
      type: fileData.type,
      size: fileData.size
    };
  } catch (error) {
    console.error('Error retrieving file info:', error);
    return null;
  }
};

// Get all files info for a record
export const getAllFilesInfo = (recordId: string): { name: string; type: string; size: number }[] => {
  try {
    const filesArray = getFilesDataForRecord(recordId);
    return filesArray.map(fileData => ({
      name: fileData.name,
      type: fileData.type,
      size: fileData.size
    }));
  } catch (error) {
    console.error('Error retrieving all files info:', error);
    return [];
  }
};

// Delete file data
const deleteFileData = (recordId: string): void => {
  const filesData = _getAllStoredFilesData();
  delete filesData[recordId];
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(filesData));
};

export const saveRecord = async (record: PQRecord): Promise<void> => {
  const records = getRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);
  
  // Handle file storage separately
  if (record.uploadedFiles && record.uploadedFiles.length > 0) {
    const filesToStore = record.uploadedFiles.filter(file => file instanceof File) as File[];
    if (filesToStore.length > 0) {
      await saveFileData(record.id, filesToStore);
    }
    // Store only references to the files
    record.uploadedFiles = record.uploadedFiles.map((file, index) => 
      file instanceof File ? `stored_file_${index}` : file
    );
  }
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getRecords = (): PQRecord[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteRecord = (id: string): void => {
  const records = getRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  // Also delete associated file data
  deleteFileData(id);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};