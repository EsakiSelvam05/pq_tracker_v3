import React, { useState, useEffect } from 'react';
import { PQRecord } from '../types';
import { saveRecord, generateId } from '../utils/storage';
import { formatDate } from '../utils/dateHelpers';
import { 
  Save, 
  X, 
  Calendar, 
  Building, 
  FileText, 
  MapPin, 
  Package, 
  MessageSquare,
  CheckCircle,
  Upload,
  Sparkles
} from 'lucide-react';
import FileUpload from './FileUpload';
import FileManager from './FileManager';
import { UploadResponse } from '../services/gcsService';

// Import shipper and buyer data
import shipperData from '../data/shipper.txt?raw';
import buyerData from '../data/buyer.txt?raw';

interface PQEntryFormProps {
  editRecord?: PQRecord;
  onSave: () => void;
  onCancel?: () => void;
}

const PQEntryForm: React.FC<PQEntryFormProps> = ({ editRecord, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<PQRecord, 'id' | 'createdAt'>>({
    date: formatDate(new Date()),
    shipperName: '',
    buyer: '',
    invoiceNumber: '',
    commodity: '',
    shippingBillReceived: 'No',
    pqStatus: 'Pending',
    pqHardcopy: 'Not Received',
    permitCopyStatus: 'Not Required',
    destinationPort: '',
    remarks: '',
    uploadedFiles: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);

  // Parse shipper and buyer data
  const shipperNames = shipperData.split('\n').filter(name => name.trim() !== '').sort();
  const buyerNames = buyerData.split('\n').filter(name => name.trim() !== '').sort();

  useEffect(() => {
    if (editRecord) {
      setFormData({
        date: editRecord.date,
        shipperName: editRecord.shipperName,
        buyer: editRecord.buyer,
        invoiceNumber: editRecord.invoiceNumber,
        commodity: editRecord.commodity,
        shippingBillReceived: editRecord.shippingBillReceived,
        pqStatus: editRecord.pqStatus,
        pqHardcopy: editRecord.pqHardcopy || 'Not Received',
        permitCopyStatus: editRecord.permitCopyStatus,
        destinationPort: editRecord.destinationPort,
        remarks: editRecord.remarks,
        uploadedFiles: editRecord.uploadedFiles || []
      });
    }
  }, [editRecord]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilesUploaded = (files: UploadResponse[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    // Update form data with file references
    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...(prev.uploadedFiles || []), ...files.map(f => f.fileName)]
    }));
  };

  const handleFileDeleted = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.fileName !== fileName));
    setFormData(prev => ({
      ...prev,
      uploadedFiles: (prev.uploadedFiles || []).filter(f => f !== fileName)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shipperName || !formData.buyer || !formData.invoiceNumber || !formData.commodity) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const recordToSave: PQRecord = {
        id: editRecord?.id || generateId(),
        ...formData,
        createdAt: editRecord?.createdAt || Date.now()
      };

      await saveRecord(recordToSave);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
        
        if (!editRecord) {
          // Reset form for new entries
          setFormData({
            date: formatDate(new Date()),
            shipperName: '',
            buyer: '',
            invoiceNumber: '',
            commodity: '',
            shippingBillReceived: 'No',
            pqStatus: 'Pending',
            pqHardcopy: 'Not Received',
            permitCopyStatus: 'Not Required',
            destinationPort: '',
            remarks: '',
            uploadedFiles: []
          });
          setUploadedFiles([]);
        }
      }, 1500);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField: React.FC<{
    label: string;
    required?: boolean;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }> = ({ label, required, children, icon }) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        {icon}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto opacity-20 animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {editRecord ? 'Record Updated!' : 'Record Saved!'}
            </h3>
            <p className="text-gray-600">
              {editRecord 
                ? 'Your PQ certificate record has been successfully updated.' 
                : 'Your PQ certificate record has been successfully created.'
              }
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Redirecting...</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-full">
          <Upload className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            {editRecord ? 'Edit Record' : 'New Entry'}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-teal-800 bg-clip-text text-transparent">
          {editRecord ? 'Edit PQ Certificate Record' : 'Create New PQ Certificate Record'}
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {editRecord 
            ? 'Update the details of your PQ certificate record'
            : 'Enter the details for your new PQ certificate record'
          }
        </p>
      </div>

      {/* Form */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="Date" 
                  required 
                  icon={<Calendar className="w-4 h-4 text-blue-600" />}
                >
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="form-input"
                    required
                  />
                </FormField>

                <FormField 
                  label="Invoice Number" 
                  required 
                  icon={<FileText className="w-4 h-4 text-blue-600" />}
                >
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    className="form-input"
                    placeholder="Enter invoice number"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="Shipper Name" 
                  required 
                  icon={<Building className="w-4 h-4 text-blue-600" />}
                >
                  <select
                    value={formData.shipperName}
                    onChange={(e) => handleInputChange('shipperName', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Shipper</option>
                    {shipperNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </FormField>

                <FormField 
                  label="Buyer Name" 
                  required 
                  icon={<Building className="w-4 h-4 text-blue-600" />}
                >
                  <select
                    value={formData.buyer}
                    onChange={(e) => handleInputChange('buyer', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Buyer</option>
                    {buyerNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="Commodity" 
                  required 
                  icon={<Package className="w-4 h-4 text-blue-600" />}
                >
                  <textarea
                    value={formData.commodity}
                    onChange={(e) => handleInputChange('commodity', e.target.value)}
                    className="form-input min-h-[100px] resize-none"
                    placeholder="Enter commodity details"
                    required
                  />
                </FormField>

                <FormField 
                  label="Destination Port/Country" 
                  icon={<MapPin className="w-4 h-4 text-blue-600" />}
                >
                  <input
                    type="text"
                    value={formData.destinationPort}
                    onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                    className="form-input"
                    placeholder="Enter destination"
                  />
                </FormField>
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Status Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField label="LEO Copy Received">
                  <select
                    value={formData.shippingBillReceived}
                    onChange={(e) => handleInputChange('shippingBillReceived', e.target.value as 'Yes' | 'No')}
                    className="form-input"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </FormField>

                <FormField label="PQ Status">
                  <select
                    value={formData.pqStatus}
                    onChange={(e) => handleInputChange('pqStatus', e.target.value as 'Pending' | 'Received')}
                    className="form-input"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                  </select>
                </FormField>

                <FormField label="PQ Hardcopy">
                  <select
                    value={formData.pqHardcopy}
                    onChange={(e) => handleInputChange('pqHardcopy', e.target.value as 'Received' | 'Not Received')}
                    className="form-input"
                  >
                    <option value="Not Received">Not Received</option>
                    <option value="Received">Received</option>
                  </select>
                </FormField>

                <FormField label="Permit Copy Status">
                  <select
                    value={formData.permitCopyStatus}
                    onChange={(e) => handleInputChange('permitCopyStatus', e.target.value as 'Received' | 'Not Received' | 'Not Required')}
                    className="form-input"
                  >
                    <option value="Not Required">Not Required</option>
                    <option value="Not Received">Not Received</option>
                    <option value="Received">Received</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">File Upload</h3>
              </div>

              {/* File Upload Component */}
              <FileUpload
                recordId={editRecord?.id || 'temp-' + Date.now()}
                onFilesUploaded={handleFilesUploaded}
                maxFiles={5}
                maxSizeInMB={10}
              />

              {/* File Manager for existing files (only in edit mode) */}
              {editRecord && (
                <div className="mt-6">
                  <FileManager
                    recordId={editRecord.id}
                    onFileDeleted={handleFileDeleted}
                  />
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Additional Information</h3>
              </div>

              <FormField 
                label="Remarks" 
                icon={<MessageSquare className="w-4 h-4 text-orange-600" />}
              >
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  className="form-input min-h-[120px] resize-none"
                  placeholder="Enter any additional remarks or notes"
                />
              </FormField>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-2xl font-semibold shadow-2xl shadow-gray-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                  <div className="relative flex items-center space-x-2">
                    <X size={20} />
                    <span>Cancel</span>
                  </div>
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-2xl shadow-green-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                <div className="relative flex items-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{editRecord ? 'Update Record' : 'Save Record'}</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PQEntryForm;