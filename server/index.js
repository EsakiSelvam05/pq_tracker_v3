const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--96435430.local-credentialless.webcontainer-api.io'] 
    : ['https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--96435430.local-credentialless.webcontainer-api.io'],
  credentials: true
}));
app.use(express.json());

// Configure Google Cloud Storage
const storage = new Storage({
  projectId: 'even-ivy-466106-d4',
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './config/gcs-service-account.json',
  // Alternative: Use environment variables for credentials
  // credentials: {
  //   client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  //   private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  // }
});

const bucket = storage.bucket('ajak_document_hub');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Excel, and image files are allowed.'), false);
    }
  }
});

// Helper function to generate unique filename
const generateUniqueFileName = (originalName, recordId) => {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `pq-records/${recordId}/${timestamp}-${baseName}${extension}`;
};

// Upload single file endpoint
app.post('/api/upload/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { recordId, description } = req.body;
    
    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    const fileName = generateUniqueFileName(req.file.originalname, recordId);
    const file = bucket.file(fileName);

    // Create a write stream to GCS
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          recordId: recordId,
          originalName: req.file.originalname,
          description: description || '',
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Handle stream events
    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file to GCS' });
    });

    stream.on('finish', async () => {
      try {
        // Make the file publicly readable (optional)
        // await file.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
        
        // Get signed URL for private access (recommended)
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        res.status(200).json({
          message: 'File uploaded successfully',
          fileName: fileName,
          originalName: req.file.originalname,
          publicUrl: publicUrl,
          signedUrl: signedUrl,
          size: req.file.size,
          contentType: req.file.mimetype
        });
      } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ error: 'File uploaded but failed to generate access URL' });
      }
    });

    // Write the file buffer to the stream
    stream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload multiple files endpoint
app.post('/api/upload/multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { recordId } = req.body;
    
    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileName = generateUniqueFileName(file.originalname, recordId);
      const gcsFile = bucket.file(fileName);

      return new Promise((resolve, reject) => {
        const stream = gcsFile.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              recordId: recordId,
              originalName: file.originalname,
              uploadedAt: new Date().toISOString()
            }
          }
        });

        stream.on('error', reject);
        stream.on('finish', async () => {
          try {
            const [signedUrl] = await gcsFile.getSignedUrl({
              action: 'read',
              expires: Date.now() + 24 * 60 * 60 * 1000,
            });

            resolve({
              fileName: fileName,
              originalName: file.originalname,
              signedUrl: signedUrl,
              size: file.size,
              contentType: file.mimetype
            });
          } catch (error) {
            reject(error);
          }
        });

        stream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadResults
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Get signed URL for file access
app.get('/api/file/signed-url/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    res.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Delete file endpoint
app.delete('/api/file/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    await file.delete();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// List files for a record
app.get('/api/files/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const [files] = await bucket.getFiles({
      prefix: `pq-records/${recordId}/`
    });

    const fileList = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000,
        });

        return {
          fileName: file.name,
          originalName: metadata.metadata?.originalName || file.name,
          size: metadata.size,
          contentType: metadata.contentType,
          uploadedAt: metadata.metadata?.uploadedAt,
          signedUrl: signedUrl
        };
      })
    );

    res.json({ files: fileList });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 files.' });
    }
  }
  
  if (error.message === 'Invalid file type. Only PDF, Excel, and image files are allowed.') {
    return res.status(400).json({ error: error.message });
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`GCS Bucket: ${process.env.GCS_BUCKET_NAME}`);
});