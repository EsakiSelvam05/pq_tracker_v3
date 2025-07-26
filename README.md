# PQ Certificate Tracker v3

A comprehensive PQ Certificate tracking application with Google Cloud Storage integration.

## Features

- **PQ Certificate Management**: Track shipping bills, PQ status, hardcopy status, and permit copies
- **Google Cloud Storage Integration**: Upload and manage files directly to GCS
- **Advanced Filtering**: Filter records by status, date range, shipper, and more
- **Export Capabilities**: Export data to Excel and PDF formats
- **Real-time Dashboard**: Monitor pending certificates and completion status
- **File Management**: Upload, preview, download, and delete files from GCS

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Google Cloud Storage Setup

1. Create a Google Cloud Project
2. Enable the Cloud Storage API
3. Create a service account with Storage Admin permissions
4. Download the service account key JSON file and store it securely
5. Create a GCS bucket for file storage

#### Storing the Service Account Key:

**Option 1: Local Development (File-based)**
```bash
# Place your service account key file in the config folder
cp path/to/your-service-account-key.json ./config/gcs-service-account.json
```

**Option 2: Production (Environment Variables) - RECOMMENDED**
```bash
# Use environment variables instead of files
export GOOGLE_CLOUD_PROJECT_ID="your-project-id"
export GOOGLE_CLOUD_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
export GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
export GCS_BUCKET_NAME="your-bucket-name"
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Google Cloud Storage Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json
GCS_BUCKET_NAME=your-bucket-name

# Alternative: Use service account key as environment variable
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend API URL (for production)
VITE_API_URL=http://localhost:3001
```

### 4. Running the Application

#### Development Mode (Frontend + Backend)
```bash
npm run dev:full
```

#### Frontend Only
```bash
npm run dev
```

#### Backend Only
```bash
npm run dev:server
```

### 5. Production Build
```bash
npm run build
```

## API Endpoints

### File Upload
- `POST /api/upload/single` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files

### File Management
- `GET /api/files/:recordId` - List files for a record
- `GET /api/file/signed-url/:fileName` - Get signed URL for file access
- `DELETE /api/file/:fileName` - Delete a file

### Health Check
- `GET /api/health` - Check API health status

## File Upload Features

- **Drag & Drop**: Intuitive drag and drop interface
- **Multiple File Types**: Support for PDF, Excel, and image files
- **File Validation**: Size and type validation
- **Progress Tracking**: Real-time upload progress
- **Error Handling**: Comprehensive error handling and retry functionality
- **Secure Storage**: Files stored securely in Google Cloud Storage
- **Signed URLs**: Secure file access using time-limited signed URLs

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Google Cloud Storage
- **Authentication**: Supabase Auth

## Security Features

- Row Level Security (RLS) with Supabase
- Secure file uploads with validation
- Time-limited signed URLs for file access
- CORS protection
- File type and size restrictions