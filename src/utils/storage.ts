import { PQRecord } from '../types';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type DbPQRecord = Database['public']['Tables']['pq_records']['Row'];
type DbPQRecordInsert = Database['public']['Tables']['pq_records']['Insert'];
type DbPQRecordUpdate = Database['public']['Tables']['pq_records']['Update'];

// Convert database record to application record
const dbRecordToAppRecord = (dbRecord: DbPQRecord): PQRecord => {
  return {
    id: dbRecord.id,
    date: dbRecord.date || '',
    shipperName: dbRecord.shipper_name,
    buyer: dbRecord.buyer,
    invoiceNumber: dbRecord.invoice_number,
    commodity: dbRecord.commodity,
    shippingBillReceived: dbRecord.shipping_bill_received ? 'Yes' : 'No',
    pqStatus: (dbRecord.pq_status as 'Pending' | 'Received') || 'Pending',
    pqHardcopy: (dbRecord.pq_hardcopy as 'Received' | 'Not Received') || 'Not Received',
    permitCopyStatus: (dbRecord.permit_copy_status as 'Received' | 'Not Received' | 'Not Required') || 'Not Required',
    destinationPort: dbRecord.destination_port || '',
    remarks: dbRecord.remarks || '',
    uploadedFiles: dbRecord.files ? (dbRecord.files as any[]) : [],
    createdAt: new Date(dbRecord.created_at || '').getTime()
  };
};

// Convert application record to database record
const appRecordToDbRecord = (appRecord: PQRecord): DbPQRecordInsert | DbPQRecordUpdate => {
  return {
    id: appRecord.id,
    date: appRecord.date || null,
    shipper_name: appRecord.shipperName,
    buyer: appRecord.buyer,
    invoice_number: appRecord.invoiceNumber,
    commodity: appRecord.commodity,
    shipping_bill_received: appRecord.shippingBillReceived === 'Yes',
    pq_status: appRecord.pqStatus,
    pq_hardcopy: appRecord.pqHardcopy,
    permit_copy_status: appRecord.permitCopyStatus,
    destination_port: appRecord.destinationPort,
    remarks: appRecord.remarks,
    files: appRecord.uploadedFiles ? JSON.parse(JSON.stringify(appRecord.uploadedFiles)) : null
  };
};

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

// Get file as Blob
export const getFileAsBlob = (recordId: string, fileIndex: number): Blob | null => {
  try {
    // For now, we'll use localStorage as fallback for file storage
    // In a production app, you'd want to use Supabase Storage
    const stored = localStorage.getItem('pq_files');
    if (!stored) return null;
    
    const filesData = JSON.parse(stored);
    const recordFiles = filesData[recordId];
    if (!recordFiles || !recordFiles[fileIndex]) return null;
    
    const fileData = recordFiles[fileIndex];
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
    const stored = localStorage.getItem('pq_files');
    if (!stored) return null;
    
    const filesData = JSON.parse(stored);
    const recordFiles = filesData[recordId];
    if (!recordFiles || !recordFiles[fileIndex]) return null;
    
    const fileData = recordFiles[fileIndex];
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
    const stored = localStorage.getItem('pq_files');
    if (!stored) return [];
    
    const filesData = JSON.parse(stored);
    const recordFiles = filesData[recordId];
    if (!recordFiles) return [];
    
    return recordFiles.map((fileData: any) => ({
      name: fileData.name,
      type: fileData.type,
      size: fileData.size
    }));
  } catch (error) {
    console.error('Error retrieving all files info:', error);
    return [];
  }
};

// Store file data (keeping localStorage for now, but files metadata will be in Supabase)
const saveFileData = async (recordId: string, files: File[]): Promise<any[]> => {
  try {
    // Convert files to base64 for localStorage (temporary solution)
    const fileDataArray = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        data: await fileToBase64(file)
      }))
    );
    
    // Store in localStorage for now
    const stored = localStorage.getItem('pq_files') || '{}';
    const filesData = JSON.parse(stored);
    filesData[recordId] = fileDataArray;
    localStorage.setItem('pq_files', JSON.stringify(filesData));
    
    // Return file references for database storage
    return fileDataArray.map((_, index) => `stored_file_${index}`);
  } catch (error) {
    console.error('Error saving file data:', error);
    return [];
  }
};

export const saveRecord = async (record: PQRecord): Promise<void> => {
  try {
    // Handle file storage separately
    let fileReferences: any[] = [];
    if (record.uploadedFiles && record.uploadedFiles.length > 0) {
      const filesToStore = record.uploadedFiles.filter(file => file instanceof File) as File[];
      if (filesToStore.length > 0) {
        fileReferences = await saveFileData(record.id, filesToStore);
      } else {
        // Keep existing file references
        fileReferences = record.uploadedFiles;
      }
    }
    
    // Prepare record for database
    const recordToSave = { ...record, uploadedFiles: fileReferences };
    const dbRecord = appRecordToDbRecord(recordToSave);
    
    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('pq_records')
      .select('id')
      .eq('id', record.id)
      .single();
    
    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from('pq_records')
        .update(dbRecord)
        .eq('id', record.id);
      
      if (error) {
        throw error;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('pq_records')
        .insert(dbRecord);
      
      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error saving record:', error);
    throw error;
  }
};

export const getRecords = (): PQRecord[] => {
  // This will be replaced with async version, but keeping sync for now
  // In a real app, you'd want to make this async and handle loading states
  return [];
};

export const getRecordsAsync = async (): Promise<PQRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('pq_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data ? data.map(dbRecordToAppRecord) : [];
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
};

export const deleteRecord = (id: string): void => {
  // Make this async in the component
  supabase
    .from('pq_records')
    .delete()
    .eq('id', id)
    .then(({ error }) => {
      if (error) {
        console.error('Error deleting record:', error);
      }
    });
  
  // Also delete associated file data from localStorage
  const stored = localStorage.getItem('pq_files') || '{}';
  const filesData = JSON.parse(stored);
  delete filesData[id];
  localStorage.setItem('pq_files', JSON.stringify(filesData));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};