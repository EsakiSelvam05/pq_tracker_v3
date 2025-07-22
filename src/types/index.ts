export interface PQRecord {
  id: string;
  date: string;
  shipperName: string;
  buyer: string;
  invoiceNumber: string;
  commodity: string;
  shippingBillReceived: 'Yes' | 'No';
  pqStatus: 'Pending' | 'Received';
  pqHardcopy: 'Received' | 'Not Received'; // NEW FIELD
  permitCopyStatus: 'Received' | 'Not Received' | 'Not Required';
  destinationPort: string;
  remarks: string;
  uploadedFiles?: (File | string)[];
  createdAt: number;
}

export interface FilterOptions {
  dateRange?: { start: string; end: string };
  shipperName?: string;
  buyer?: string;
  invoiceNumber?: string;
  pqStatus?: string;
  pqHardcopy?: string; // NEW FILTER OPTION
  destinationPort?: string;
  shippingBillReceived?: string;
  permitCopyStatus?: string;
}

export interface DashboardStats {
  totalContainers: number;
  pendingPQ: number;
  certificatesReceived: number;
  pqHardcopyMissing: number; // NEW STAT
  delaysOver48Hours: number;
}