import React, { useState, useEffect } from 'react';
import { PQRecord } from '../types';
import { saveRecord, generateId } from '../utils/storage';
import { formatDate } from '../utils/dateHelpers';
import * as XLSX from 'xlsx';
import { 
  Save, 
  X, 
  Upload, 
  FileText, 
  Building, 
  User, 
  Package, 
  MapPin, 
  Calendar,
  FileSpreadsheet,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface PQEntryFormProps {
  editRecord?: PQRecord;
  onSave: () => void;
  onCancel?: () => void;
}

// Shipper names from the data file
const SHIPPER_NAMES = [
  'Setha Spices',
  'Pixagons',
  'Hamid',
  'Daisy food',
  'Garden Valley',
  'Kiruba Exports',
  'Velautham Exports',
  'Indian Chillies',
  'VPSA',
  'Pon Food',
  'Babbula',
  'EverGreen',
  'Thai Pan',
  'Jai Pan',
  'Aachi Masala',
  'Nutco',
  'Ahad Agro',
  'SK Foods',
  'Sri Vara Siddi',
  'Razack Trading',
  'Rathnaa Agro',
  'AACHI MASALA FOODS (P) LTD',
  'AHAD AGRO FOODS',
  'BABBULA VENKATESHWARLU',
  'DAISI FOOD PRODUCTS',
  'EVERGREEN FOOD PRODUCER',
  'GARDEN VALLEY EXPORT CORPORATION',
  'HAMID INTERNATIONAL',
  'INDIAN CHILLIES PRODUCTS COMPANY',
  'JAIPAN EXPORT EMPIRE',
  'KIRUBA EXPORT',
  'LERAR INTERNATIONAL INC',
  'MODI MARKETING',
  'MODI EXPORT',
  'NAZIDA EXPORTS AND IMPORTS',
  'NUTCO PRIVATE LIMITED',
  'PIXAGONS DIGITAL PRIVATE LIMITED',
  'PON FOOD PRODUCTS',
  'RAJAMA EXPORT',
  'RATHNAA AGRO IMPEX',
  'RAZACK TRADING COMPANY',
  'SAPTHAGIRI EXPORTERS',
  'SETHA SPICES & HERBS INTERNATIONAL EXPORTS',
  'SHIVAM IMPEX',
  'SK FOODS INDUSTRIES',
  'SRI VARA SIDDI AGRO FOODS',
  'THAI PAN GLOBAL TRADING'
];

// Buyer names from the data file
const BUYER_NAMES = [
  'SIK WENG SDN.BHD.',
  'IYARATHAI IMPORT EXPORT CO., LTD,',
  'DA DA AGRICULTURAL IMPPORT & EXPORT  COMPANY LIMITED.',
  'RATHNAM TRADE SOLUTIONS PVT LTD',
  'PERNIAGAAN SENANG JADI IMPORT',
  'SANTHA STORE FLOURMILL SDN BHD ,',
  'PT.SEKAR USAHA GEMILANG',
  'QINGDAO SURSUM TRADING CO., LTD.,',
  'SYARIKAT PERNIAGAAN THYE LEAN SDN.',
  'KEN HIN FOOD INDUSTRIES SDN BHD',
  'THUA HENG IMPORT EXPORT SDN BHD',
  'NAM HEONG TRADING SDN BHD',
  'XUZHOU XIAOSONGSHU AGRICULTRUAL',
  'AGM IMAN RESOURCES (M) SDN BHD',
  'SYARIKAT KILANG REMPA JAYA SAKTI',
  'ENG SHENG SDN.BHD',
  'DAIWA FINE CHEMICALS CO.,LTD,',
  'TAN BEE LEE SDN.BHD.',
  'W AGRI FOOD PRODUCT SDN BHD',
  'NSK TRADE CITY (RAWANG JAYA) SDN,BHD.',
  'SHUN EE TRADING SDN BHD',
  'TAN BEE LEE SDN.BHD',
  'POO TRADING IMPORT AND EXPORT SDN BHD',
  'SENG THYE AGENCY SDN BHD',
  'QINGDAO ZHONGKAI JIANDA INTERNATIONAL TRADE CO., LTD',
  'CHANG SHENG HAU SDN.BHD',
  'LUN HENG SDN BHD',
  'AM PREMIUM SDN.BHD.(1086586-W)',
  'NSK TRADE CITY (RAWANG JAYA) SDN,BHD',
  'KT IMPEX SDN BHD',
  'YS INTERNATIONAL TRADING SDN. BHD. BRN (1364347-M)',
  'ONE B IMPORT & EXPORT SDN.BHD',
  'HASIL LAUTAN HONG KEE SDN BHD (616691-W)',
  'WA JUN CHAN SDN.BHD',
  'PEMBORONG MAJU A&A SDN BHD.',
  'DF JAYA SDN BHD.(1179317-W)',
  'MLF TRADING SDN. BHD.',
  'QINGDAO FIRST FRESH SUPPLY CHAIN CO., LTD',
  'ECONSAVE RETAIL SDN BHD',
  'GUANGZHOU CHANGYOU INTERNATIONAL TRADE CO., LTD',
  'HIKING (JIMO) INTERNATIONAL TRADE CO., LTD',
  'SHENZHEN OHENG IMPORT & EXPORT CO., LTD',
  'PEMBORONG MAJU A&A SDN BHD',
  'UNACO ENTERPRISE SDN BHD',
  'YI TAI HUNG ENTERPRISE SDN. BHD.',
  'THYE SHEN HUNG SDN BHD',
  'THIEN LEE MARKETING SDN. BHD.',
  'SOON THYE HANG MARINE PRODUCTS SDN BHD (53387-D)',
  'SUI HIN CHAN ENTERPRISE (M) SDN BHD',
  'SIN GUAN BROTHERS CO,',
  'SENG THYE AGENCY SDN BHD.,',
  'PERNIAGAAN SENANG JADI IMPORT & EXPORT SDN BHD',
  'SYARIKAT PING THYE TRADING CO. (PG)',
  'NSK TRADING SDN BHD',
  'LEONG HUAT TIEN GUAN TRADING SDN BHD,',
  'LEE HENG CHEONG TRADING SDN BHD',
  'KIAN HIN ENTERPRISE SDN BHD (600066-T)',
  'JWC MARINE PRODUCTS SDN BHD',
  'JS BORNEO JAYA SDN BHD',
  'IMBASJAYA SDN BHD',
  'HEIWADO SDN BHD',
  'HB ASAM JAWA ENTERPRISE SDN BHD',
  'CHIN HEONG (PG) SDN BHD',
  'C-CARE ENTERPRISE SDN BHD',
  'BRIDGE TRADING SDN BHD,',
  'BP HEYAP LEYONG SDN BHD',
  'AM PREMIUM SDN BHD',
  'ZEACON LOGISTICS CO., LTD.',
  'THAIBHUMI  ASIA CO., LTD.',
  'ONE B IMPORT & EXPORT SDN.BHD.',
  'SOON CHEONG MARINE PRODUCTS SDN. BHD',
  'DF JAYA SDN BHD',
  'ENG SHENG SDN BHD',
  'HENAN JIANWEI OCEAN INTERNATIONAL TRADE CO., LTD',
  'DE OCEAN MARKETING SDN.BHD',
  'AM PREMIUM SDN BHD.',
  'TONG HUANG TRADING SDN.BHD',
  'LUN HENG SDN BHD.,',
  'AKS NIVAAS SDN BHD (607093-P)',
  'JONGPAO TRADING CO.,LTD',
  'DDT 2019 LOGISTICS CO.,LTD',
  'CV. RINDANG TAMAN SEGAR',
  'S.VPL IMPEX (PVT) LTD',
  'QINGDAO HIDOW SUPPLY CHAIN TECHNOLOGY CO.,LTD',
  'CHIN HEONG (K.L) SDN. BHD.',
  'TECHNO FRESH AGRO - PRODUCE SDN BHD',
  'SOON CHEONG MARINE PRODUCTS SDN. BHD.',
  'MX FRUIT & VEGETABLE (MALAYSIA) SDN BHD',
  'LO SIEW LIN SDN BHD',
  'BRIDGE TRADING SDN BHD',
  'S MART GLOBAL',
  'GNANAM IMPORTS PVT LTD',
  'THE VIGNA TRADERS (PVT) LTD',
  'NPK TRADERS (PVT) LTD',
  'LUM CHUAN SDN BHD',
  'TANGKAK  SENG LEONG TRADING SDN.BHD.(845212 – W )',
  'SAN SWEE FATT ENTERPRISE SDN BHD (412430-U)',
  'KTS SERVICE & TRADE CO., LTD.',
  'YI TAI HUNG ENTERPRISE SDN BHD.',
  'ZAI HONG SDN.BHD.(574749-K)',
  'K.S. MURUGAN FLOUR MILL SDN BHD',
  'ERA INTEGRATED LOGISTICS SDN BHD',
  'PT.GLOBAL BERKAT SEJAHTERA',
  'PT. MULTI SAMA INDONESIA',
  'PT. SEGAR INDO MAKMUR',
  'PT. TUNAS MAJU SEJAHTERA',
  'PT DIGITAL KREASI ASIA',
  'PT. BINTANG TSURAYYA SAKTI',
  'PT GULMA TANI JAYA',
  'ROYAL PACIFIC PTE LTD',
  'QINGDAO HAPPINESS ELECTRONIC  COMMERCE CO., LTD',
  'SAIRAH TRADING SDN BHD',
  'KMN IMPORT AND EXPORT (THAILAND) CO.,LTD',
  'JNTT CO., LTD',
  'SILVERWARE CONCEPT COMPANY ( ROC: 127470 )',
  'THAI BINH AGRICULTURAL XNK LIMITED COMPANY',
  '5 LANKA ( PRIVATE ) LIMITED',
  'GOLD TRADER CO.,LTD',
  'AUTO REGAL SDN.BHD. (738121-A)',
  'SH GROCER SDN BHD',
  'PT. SUMBER ROSO AGROMAKMUR,',
  'HEIWADO SDN. BHD.',
  'NBT BORNEO TRADING SDN. BHD',
  'SYARIKAT PING THYE TRADING CO.(PG) SDN BHD',
  'FARM PRICE SDN BHD',
  'LAIWU TAIFENG FOODS CO.,LTD',
  'SMART DEALZ PRIVATE LIMITED',
  'H.K. IMPORTS,',
  'JP AGRIMATE SDN BHD(1314585-W)',
  'YONG GA JAYA TRADING SDN BHD',
  'SUIYONG SDN BHD',
  'HOE HING CHAN SDN BHD',
  'WP TRADE CO., LTD',
  'CHIN HEONG (PG) SDN. BHD.',
  'SETIA KAWAN MARKETING SDN BHD',
  'HUA FOONG TRADING SDN. BHD.',
  'PT SUMBER REJEKI PALAWIJA',
  'CV. ERA JAYA ABADI',
  'CV. REJEKI PUTRA UTAMA',
  'PT. AGRIBISNIS LINTAS NUSANTARA',
  'JIN WEI GLOBAL SDN BHD',
  'YEO WHOLESALE AND TRADING PTE LTD',
  'RISE COMMODITY AND DISTRIBUTOR',
  'SRI MAJU JAYA TRADING',
  'PT.INDO GLOBAL IMPEX',
  'HENG HUAT CHAN SDN. BHD',
  'PT TERRA PANGAN LESTARI',
  'SIANG HENG (SARAWAK) SDN. BHD',
  'SELVI MILLS (S) PTE LTD,',
  'LEE GAIK KHUAN COFFEE POWDER & FLOUR MILL SDN BHD,',
  'BABA PRODUCTS (M) SDN. BHD.',
  'STASURIA RESOURCES SDN. BHD.',
  'K.N.P.TRADING PRIVATE LIMITED,',
  'DEEP TRADING CO., LTD.,',
  'MMK SPICES SDN. BHD.',
  'MAPS ENTERPRISE SDN BHD',
  'SING KEE RESOURCES SDN.BHD.',
  'THYE LEAN CHAN ENTERPRISE SDN BHD',
  'NBT BORNEO TRADING SDN.BHD.',
  'EVERGREEN (1979) TRADING SDN BHD',
  'WMS FOOD TRADING SDN BHD',
  'WHA HUNG ENTERPRISE SDN. BHD.,',
  'KANDY TRADE CENTRE (PVT) LTD.,',
  'FS TRADERS (PVT) LIMITED',
  'A.S.P SIVAN PILLAI',
  'WIJAYA PRODUCTS (PVT) LTD',
  'PT. ADIKA BASUKI JAYA',
  'GNANAM IMPORTS (PVT) LIMITED',
  'TECK SANG PTE LTD,',
  'VENE TRADERS',
  'SHREE RAM IMPEX',
  'TITA IMPRESS LIMITED PARTNERSHIP',
  'BEST MARKETING',
  'THE VIGNA TRADERS PRIVATE LIMITED',
  'SARA IMPEX (PVT) LTD.',
  'HARI TRADERS',
  'ROYAL PASIFIC PTE LTD',
  'SYNSEA SHIPPING & LOGISTICS PTE LTD',
  'HUI FATT TRADING SDN BHD',
  'K.I.AGRO LANKA (PVT) LTD',
  'VELS SPICES PTY LTD,',
  'GNANESHWARAN RAMANIDEVI',
  'MYMI FOOD ENTERPRISE (M) SDN BHD',
  'MODERN STORE (M) SDN.BHD',
  'SENORA PVT LTD',
  'STEMO (PVT) LTD',
  'CONVENIENCE FOODS LANKA PLC',
  'DAIWA FINE CHEMICALS CO.,LTD',
  'VITHAYATHIL IMPORTS PTY LTD',
  'NOVUS INTERNATIONAL TRADING LLC',
  'HEBRON PVT LTD',
  'FLAVOURS INTERNATIONAL',
  'JERO GLOBAL SDN BHD (1232151-V)',
  'USHA FOOD IMPORTS PTY LTD',
  'BAJARIA GLOBAL PTY LTD',
  'SRI MURUGAN MANUFACTURING PTE LTD.,',
  'MDT ARABIA TRADING COMPANY',
  'ALZOBA GENERAL TRADING & CONTRACTING CO.W.L.L / KUWAIT FINANCE HOUSE',
  'UNIVERSAL ENTERPRISES',
  'ASHIRWAD DISTRIBUTION CO LTD'
];

// Country list in the exact order specified
const countryList = [
  'Sri Lanka',
  'Malaysia',
  'Singapore',
  'Thailand',
  'Vietnam',
  'Maldives',
  'UAE',
  'Kuwait',
  'China',
  'Australia',
  'Dubai',
  'SEYCHELLES',
  'BRUNEI',
  'Maldives',
  'Canada',
  'UK',
  'USA',
  'Africa'
];

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
    uploadedInvoice: undefined
  });

  const [selectedShipper, setSelectedShipper] = useState<string>('');
  const [customShipperName, setCustomShipperName] = useState<string>('');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('');
  const [customBuyerName, setCustomBuyerName] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [customCountryName, setCustomCountryName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
    extractedFields?: string[];
  }>({ type: null, message: '' });
  const [previewFile, setPreviewFile] = useState<{
    fileName: string;
    fileUrl: string;
  } | null>(null);

  useEffect(() => {
    if (editRecord) {
      // Check if the shipper name exists in our predefined list
      const existingShipper = SHIPPER_NAMES.find(name => name === editRecord.shipperName);
      if (existingShipper) {
        setSelectedShipper(existingShipper);
        setCustomShipperName('');
      } else {
        setSelectedShipper('Others');
        setCustomShipperName(editRecord.shipperName);
      }
      
      // Check if the buyer name exists in our predefined list
      const existingBuyer = BUYER_NAMES.find(name => name === editRecord.buyer);
      if (existingBuyer) {
        setSelectedBuyer(existingBuyer);
        setCustomBuyerName('');
      } else {
        setSelectedBuyer('Others');
        setCustomBuyerName(editRecord.buyer);
      }

      // Check if country is in the predefined list
      if (countryList.includes(editRecord.destinationPort)) {
        setSelectedCountry(editRecord.destinationPort);
        setCustomCountryName('');
      } else {
        setSelectedCountry('Others');
        setCustomCountryName(editRecord.destinationPort);
      }
      
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
    } else {
      setSelectedShipper('');
      setCustomShipperName('');
      setSelectedBuyer('');
      setCustomBuyerName('');
      setSelectedCountry('');
      setCustomCountryName('');
    }
  }, [editRecord]);

  // Update form data when shipper selection changes
  useEffect(() => {
    if (selectedShipper === 'Others') {
      setFormData(prev => ({ ...prev, shipperName: customShipperName }));
    } else if (selectedShipper) {
      setFormData(prev => ({ ...prev, shipperName: selectedShipper }));
      setCustomShipperName('');
    }
  }, [selectedShipper, customShipperName]);

  // Update form data when buyer selection changes
  useEffect(() => {
    if (selectedBuyer === 'Others') {
      setFormData(prev => ({ ...prev, buyer: customBuyerName }));
    } else if (selectedBuyer) {
      setFormData(prev => ({ ...prev, buyer: selectedBuyer }));
      setCustomBuyerName('');
    }
  }, [selectedBuyer, customBuyerName]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShipperDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedShipper(value);
    if (value !== 'Others') {
      setCustomShipperName('');
    }
  };

  const handleCustomShipperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomShipperName(e.target.value);
  };

  const handleBuyerDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBuyer(value);
    if (value !== 'Others') {
      setCustomBuyerName('');
    }
  };

  const handleCustomBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomBuyerName(e.target.value);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    if (value !== 'Others') {
      setCustomCountryName('');
    }
  };
  const extractDataFromExcel = async (file: File) => {
    try {
      setExtractionStatus({ type: 'info', message: 'Analyzing Excel file...' });
      
      console.log('🔍 Starting Excel extraction for file:', file.name);
      console.log('📊 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      console.log('📋 Available sheets:', workbook.SheetNames);
      console.log('📄 Using sheet:', sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false,
        blankrows: false
      }) as string[][];

      console.log('📊 Raw Excel data:', jsonData);
      console.log('📏 Data dimensions:', {
        totalRows: jsonData.length,
        hasHeaders: jsonData.length > 0,
        hasData: jsonData.length > 1
      });

      if (jsonData.length < 2) {
        setExtractionStatus({ 
          type: 'error', 
          message: 'Excel file must contain at least a header row and one data row.' 
        });
        console.log('❌ Insufficient data rows');
        return;
      }

      const headers = jsonData[0].map(h => {
        const header = h?.toString().toLowerCase().trim() || '';
        console.log('🏷️ Processing header:', h, '→', header);
        return header;
      });
      const firstDataRow = jsonData[1];
      
      console.log('📋 Headers found:', headers);
      console.log('📊 First data row:', firstDataRow);

      const extractedFields: string[] = [];
      let newFormData = { ...formData };

      // Helper function to find column index
      const findColumnIndex = (patterns: string[], fieldName: string): number => {
        console.log(`🔍 Looking for ${fieldName} with patterns:`, patterns);
        for (const pattern of patterns) {
          console.log(`  🔎 Checking pattern: "${pattern}"`);
          const index = headers.findIndex((h, idx) => {
            const cleanHeader = h.replace(/[^a-z0-9]/g, '');
            const cleanPattern = pattern.replace(/[^a-z0-9]/g, '');
            
            const exactMatch = h === pattern;
            const includesMatch = h.includes(pattern);
            const cleanMatch = cleanHeader.includes(cleanPattern);
            
            console.log(`    📍 Header[${idx}]: "${h}" vs "${pattern}"`, {
              exactMatch,
              includesMatch,
              cleanMatch,
              cleanHeader,
              cleanPattern
            });
            
            return exactMatch || includesMatch || cleanMatch;
          });
          
          if (index !== -1) {
            console.log(`  ✅ Found ${fieldName} at index ${index} with pattern "${pattern}"`);
            return index;
          }
        }
        console.log(`  ❌ No match found for ${fieldName}`);
        return -1;
      };

      // Extract Shipment Date
      const datePatterns = [
        'date', 'shipment date', 'dispatch date', 'shipping date', 'invoice date',
        'shipmentdate', 'dispatchdate', 'shippingdate', 'invoicedate',
        'ship date', 'export date', 'departure date'
      ];
      const dateIndex = findColumnIndex(datePatterns, 'Shipment Date');
      if (dateIndex !== -1 && firstDataRow[dateIndex]) {
        const dateValue = firstDataRow[dateIndex].toString().trim();
        console.log('📅 Processing date value:', dateValue);
        if (dateValue) {
          // Try to parse different date formats
          let parsedDate = null;
          
          // Try Excel serial date first
          if (!isNaN(Number(dateValue)) && Number(dateValue) > 40000) {
            console.log('📅 Parsing as Excel serial date');
            const excelDate = XLSX.SSF.parse_date_code(Number(dateValue));
            if (excelDate) {
              parsedDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
              console.log('📅 Excel date parsed:', parsedDate);
            }
          } else {
            // Try standard date parsing
            console.log('📅 Parsing as standard date');
            parsedDate = new Date(dateValue);
            console.log('📅 Standard date parsed:', parsedDate);
          }
          
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            newFormData.date = formatDate(parsedDate);
            extractedFields.push('Shipment Date');
            console.log('✅ Date extracted:', newFormData.date);
          } else {
            console.log('❌ Failed to parse date:', dateValue);
          }
        }
      }

      // Extract Shipper Name
      const shipperPatterns = [
        'shipper', 'exporter', 'seller', 'shipper name', 'exporter name',
        'shippername', 'exportername', 'shipping company', 'export company'
      ];
      const shipperIndex = findColumnIndex(shipperPatterns, 'Shipper Name');
      if (shipperIndex !== -1 && firstDataRow[shipperIndex]) {
        const shipperValue = firstDataRow[shipperIndex].toString().trim();
        console.log('🏢 Processing shipper value:', shipperValue);
        if (shipperValue) {
          newFormData.shipperName = shipperValue;
          extractedFields.push('Shipper Name');
          console.log('✅ Shipper extracted:', shipperValue);
        }
      }

      // Extract Buyer Name
      const buyerPatterns = [
        'buyer', 'importer', 'consignee', 'buyer name', 'importer name',
        'buyername', 'importername', 'importing company', 'import company'
      ];
      const buyerIndex = findColumnIndex(buyerPatterns, 'Buyer Name');
      if (buyerIndex !== -1 && firstDataRow[buyerIndex]) {
        const buyerValue = firstDataRow[buyerIndex].toString().trim();
        console.log('🏪 Processing buyer value:', buyerValue);
        if (buyerValue) {
          newFormData.buyer = buyerValue;
          extractedFields.push('Buyer Name');
          console.log('✅ Buyer extracted:', buyerValue);
        }
      }

      // Extract Invoice Number
      const invoicePatterns = [
        'invoice', 'invoice number', 'invoice no', 'invoice #', 'invoiceno',
        'invoicenumber', 'inv no', 'inv number', 'bill no', 'bill number'
      ];
      const invoiceIndex = findColumnIndex(invoicePatterns, 'Invoice Number');
      if (invoiceIndex !== -1 && firstDataRow[invoiceIndex]) {
        const invoiceValue = firstDataRow[invoiceIndex].toString().trim();
        console.log('📄 Processing invoice value:', invoiceValue);
        if (invoiceValue) {
          newFormData.invoiceNumber = invoiceValue;
          extractedFields.push('Invoice Number');
          console.log('✅ Invoice extracted:', invoiceValue);
        }
      }

      // Extract Destination Country
      const destinationPatterns = [
        'destination', 'country', 'destination country', 'dest country', 
        'discharge port', 'final destination', 'delivery country', 'import country',
        'receiving country', 'target country', 'port of discharge',
        'destinationcountry', 'destcountry', 'importcountry', 'delivercountry'
      ];
      const destinationIndex = findColumnIndex(destinationPatterns, 'Destination Country');
      if (destinationIndex !== -1 && firstDataRow[destinationIndex]) {
        const destinationValue = firstDataRow[destinationIndex].toString().trim();
        console.log('🌍 Processing destination value:', destinationValue);
        if (destinationValue) {
          newFormData.destinationPort = destinationValue;
          extractedFields.push('Destination Country');
          console.log('✅ Destination extracted:', destinationValue);
        }
      }

      // Extract Commodity
      const commodityPatterns = [
        'commodity', 'product', 'goods', 'description', 'item', 
        'agro products', 'products', 'commodity description',
        'agroproducts', 'commoditydescription', 'product description'
      ];
      const commodityIndex = findColumnIndex(commodityPatterns, 'Commodity');
      if (commodityIndex !== -1 && firstDataRow[commodityIndex]) {
        const commodityValue = firstDataRow[commodityIndex].toString().trim();
        console.log('📦 Processing commodity value:', commodityValue);
        if (commodityValue) {
          newFormData.commodity = commodityValue;
          extractedFields.push('Commodity');
          console.log('✅ Commodity extracted:', commodityValue);
        }
      }

      // Update form data
      console.log('📝 Form data before update:', formData);
      console.log('📝 Form data after update:', newFormData);
      console.log('🎯 Extracted fields:', extractedFields);

      // Force update the form data
      setFormData(prevData => {
        console.log('🔄 Updating form data from:', prevData);
        console.log('🔄 Updating form data to:', newFormData);
        return newFormData;
      });
      if (extractedFields.length > 0) {
        setExtractionStatus({
          type: 'success',
          message: `Successfully extracted data from Excel file!`,
          extractedFields
        });
        console.log('✅ Extraction successful!');
      } else {
        setExtractionStatus({
          type: 'error',
          message: `No matching data fields found. Available headers: ${headers.join(', ')}`
        });
        console.log('❌ No fields extracted. Available headers:', headers);
      }

    } catch (error) {
      console.error('Error extracting data from Excel:', error);
      setExtractionStatus({
        type: 'error',
        message: 'Error reading Excel file. Please ensure it\'s a valid Excel file and try again.'
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setFormData(prev => ({ 
        ...prev, 
        uploadedFiles: [...(prev.uploadedFiles || []), ...newFiles]
      }));
    }
    
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handlePreviewFile = (index: number) => {
    const file = formData.uploadedFiles?.[index];
    if (file && file instanceof File) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewFile({
        fileName: file.name,
        fileUrl: fileUrl
      });
    }
  };

  const handleDownloadFile = (index: number) => {
    const file = formData.uploadedFiles?.[index];
    if (file && file instanceof File) {
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteFile = (index: number) => {
    const file = formData.uploadedFiles?.[index];
    const fileName = file instanceof File ? file.name : `File ${index + 1}`;
    
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      setFormData(prev => ({ 
        ...prev, 
        uploadedFiles: prev.uploadedFiles?.filter((_, i) => i !== index) || []
      }));
      setExtractionStatus({ type: null, message: '' });
    }
  };

  const closePreview = () => {
    if (previewFile?.fileUrl) {
      URL.revokeObjectURL(previewFile.fileUrl);
    }
    setPreviewFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      const record: PQRecord = {
        id: editRecord?.id || generateId(),
        ...formData,
        destinationPort: selectedCountry === 'Others' ? customCountryName : selectedCountry,
        createdAt: editRecord?.createdAt || Date.now()
      };

      await saveRecord(record);
      
      // Show success notification
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
      // Reset form if creating new record
      if (!editRecord) {
        setSelectedShipper('');
        setCustomShipperName('');
        setSelectedBuyer('');
        setCustomBuyerName('');
        setSelectedCountry('');
        setCustomCountryName('');
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
          uploadedInvoice: undefined
        });
        setExtractionStatus({ type: null, message: '' });
      }

      onSave();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderExtractionStatus = () => {
    if (!extractionStatus.type) return null;

    const getStatusIcon = () => {
      switch (extractionStatus.type) {
        case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
        case 'info': return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
        default: return null;
      }
    };

    const getStatusBgColor = () => {
      switch (extractionStatus.type) {
        case 'success': return 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-300';
        case 'error': return 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-red-300';
        case 'info': return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-blue-300';
        default: return '';
      }
    };

    return (
      <div className={`p-4 rounded-2xl border-2 ${getStatusBgColor()}`}>
        <div className="flex items-start space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{extractionStatus.message}</p>
            {extractionStatus.extractedFields && extractionStatus.extractedFields.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Extracted fields:</p>
                <div className="flex flex-wrap gap-1">
                  {extractionStatus.extractedFields.map((field, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white/60 rounded-lg text-xs font-medium text-gray-700"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFileUploadSection = () => {
    const hasFiles = formData.uploadedFiles && formData.uploadedFiles.length > 0;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Invoice Files</h3>
            <p className="text-sm text-gray-600">Upload multiple files for record keeping</p>
          </div>
        </div>
        
        {/* Upload Area - Always Visible */}
        <div className="relative">
          <label
            htmlFor="invoice-upload"
            className="group relative overflow-hidden flex items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {hasFiles ? 'Upload More Files' : 'Upload Invoice Files'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Select multiple files • Supports: PDF, JPG, PNG, XLS, XLSX, DOC, DOCX
                </p>
              </div>
            </div>
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="invoice-upload"
          />
        </div>

        {/* Uploaded Files List */}
        {hasFiles && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">
                Uploaded Files ({formData.uploadedFiles?.length || 0})
              </h4>
            </div>
            
            <div className="space-y-2">
              {formData.uploadedFiles?.map((file, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                        <FileSpreadsheet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {file instanceof File ? file.name : `File ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {file instanceof File ? `${(file.size / 1024).toFixed(1)} KB` : 'Uploaded file'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handlePreviewFile(index)}
                        className="group relative overflow-hidden p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300"
                        title="Preview file"
                      >
                        <Eye size={14} className="relative" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(index)}
                        className="group relative overflow-hidden p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300"
                        title="Download file"
                      >
                        <Download size={14} className="relative" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(index)}
                        className="group relative overflow-hidden p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300"
                        title="Delete file"
                      >
                        <Trash2 size={14} className="relative" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 space-y-8 p-8">
      {/* Success Notification */}
      {showSaveSuccess && (
        <div className="fixed top-24 right-8 z-50 animate-slideInRight">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400 flex items-center space-x-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold">Record Saved Successfully!</p>
              <p className="text-sm text-green-100">Your PQ record has been saved to the database.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-100/80 to-indigo-100/80 backdrop-blur-xl rounded-full border border-purple-200/50 shadow-lg">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
            {editRecord ? 'Edit PQ Certificate' : 'New PQ Certificate Entry'}
          </span>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-800 via-indigo-800 to-pink-800 bg-clip-text text-transparent drop-shadow-sm">
          {editRecord ? 'Edit Certificate' : 'Create New Certificate'}
        </h2>
        <p className="text-purple-700/80 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
          {editRecord 
            ? 'Update your PQ certificate information with our beautiful form interface' 
            : 'Create a new PQ certificate record with our intuitive and elegant form system'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
        {/* Invoice Upload Section */}
        <div className="space-y-6">
          {renderFileUploadSection()}
        </div>

        {/* Shipment Details */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Shipment Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Shipment Date *</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              <p className="text-xs text-gray-500">Date of shipment dispatch</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Shipper Name *</span>
              </label>
              <select
                value={selectedShipper}
                onChange={handleShipperDropdownChange}
                className="form-input"
                required
              >
                <option value="">Select Shipper...</option>
                {SHIPPER_NAMES.map((shipper, index) => (
                  <option key={index} value={shipper}>
                    {shipper}
                  </option>
                ))}
                <option value="Others">Others (Enter manually)</option>
              </select>
              {selectedShipper === 'Others' && (
                <input
                  type="text"
                  value={customShipperName}
                  onChange={handleCustomShipperChange}
                  placeholder="Enter custom shipper name..."
                  className="form-input mt-2"
                  required
                />
              )}
              <p className="text-xs text-gray-500">Exporting company name</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <User className="w-4 h-4 text-blue-600" />
                <span>Buyer Name *</span>
              </label>
              <select
                value={selectedBuyer}
                onChange={handleBuyerDropdownChange}
                className="form-input"
                required
              >
                <option value="">Select Buyer...</option>
                {BUYER_NAMES.map((buyer, index) => (
                  <option key={index} value={buyer}>
                    {buyer}
                  </option>
                ))}
                <option value="Others">Others (Enter manually)</option>
              </select>
              {selectedBuyer === 'Others' && (
                <input
                  type="text"
                  value={customBuyerName}
                  onChange={handleCustomBuyerChange}
                  placeholder="Enter custom buyer name..."
                  className="form-input mt-2"
                  required
                />
              )}
              <p className="text-xs text-gray-500">Importing company or consignee</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Invoice Number *</span>
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter invoice number..."
                className="form-input"
              />
              <p className="text-xs text-gray-500">Format: RTC/037/2025-26 (date excluded)</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Destination Country/Port *</span>
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Select Country...</option>
                {countryList.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
                <option value="Others">Others (Enter manually)</option>
              </select>
              
              {selectedCountry === 'Others' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customCountryName}
                    onChange={(e) => setCustomCountryName(e.target.value)}
                    className="form-input"
                    placeholder="Enter country/port name manually"
                    required
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">Final destination country</p>
            </div>
          </div>
        </div>

        {/* Commodity Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
              <Package className="w-4 h-4 text-orange-600" />
              <span>Commodity (Agro Products) *</span>
            </label>
            <textarea
              name="commodity"
              value={formData.commodity}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder="Enter commodity (agro products)..."
              className="form-input resize-none"
            />
            <p className="text-xs text-gray-500">Examples: Red Chillies, Turmeric Powder, Basmati Rice, Organic Jaggery, Fresh Onions, Assorted Spices</p>
          </div>
        </div>

        {/* Status Information */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Shipping Bill Copy</span>
              </label>
              <select
                name="shippingBillReceived"
                value={formData.shippingBillReceived}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 text-gray-700 font-medium transition-all duration-300 ${
                  formData.shippingBillReceived === 'Yes' 
                    ? 'bg-green-50 border-green-200 focus:ring-green-500 focus:border-green-500' 
                    : 'bg-red-50 border-red-200 focus:ring-red-500 focus:border-red-500'
                }`}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Document received status</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <div className="w-4 h-4 text-blue-500">⚡</div>
                <span>PQ Status</span>
              </label>
              <select
                name="pqStatus"
                value={formData.pqStatus}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 text-gray-700 font-medium transition-all duration-300 ${
                  formData.pqStatus === 'Received' 
                    ? 'bg-green-50 border-green-200 focus:ring-green-500 focus:border-green-500' 
                    : 'bg-red-50 border-red-200 focus:ring-red-500 focus:border-red-500'
                }`}
              >
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Phytosanitary certificate status</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <div className="w-4 h-4 text-blue-500">🏆</div>
                <span>PQ Hardcopy</span>
              </label>
              <select
                name="pqHardcopy"
                value={formData.pqHardcopy}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 text-gray-700 font-medium transition-all duration-300 ${
                  formData.pqHardcopy === 'Received' 
                    ? 'bg-green-50 border-green-200 focus:ring-green-500 focus:border-green-500' 
                    : 'bg-red-50 border-red-200 focus:ring-red-500 focus:border-red-500'
                }`}
              >
                <option value="Not Received">Not Received</option>
                <option value="Received">Received</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Physical PQ certificate received</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Permit Copy Status</span>
              </label>
              <select
                name="permitCopyStatus"
                value={formData.permitCopyStatus}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 text-gray-700 font-medium transition-all duration-300 ${
                  formData.permitCopyStatus === 'Not Received' 
                    ? 'bg-red-50 border-red-200 focus:ring-red-500 focus:border-red-500' 
                    : 'bg-green-50 border-green-200 focus:ring-green-500 focus:border-green-500'
                }`}
              >
                <option value="Not Required">Not Required</option>
                <option value="Not Received">Not Received</option>
                <option value="Received">Received</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Import permit document status</p>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
              <div className="w-4 h-4 text-blue-500">💬</div>
              <span>Remarks</span>
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter remarks..."
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">Additional notes or special instructions</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-2xl font-semibold shadow-2xl shadow-gray-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center space-x-2">
                  <X size={20} />
                  <span>Cancel</span>
                </div>
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-2xl shadow-green-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
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

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Invoice File Preview</h3>
                  <p className="text-sm text-gray-600">{previewFile.fileName}</p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 max-h-[80vh] overflow-auto">
              {previewFile.fileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewFile.fileUrl}
                  className="w-full h-[75vh] border border-gray-200 rounded-xl"
                  title="File Preview"
                />
              ) : previewFile.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <div className="flex justify-center">
                  <img
                    src={previewFile.fileUrl}
                    alt="File Preview"
                    className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Preview Not Available</h3>
                  <p className="text-gray-500">This file type cannot be previewed in the browser</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PQEntryForm;