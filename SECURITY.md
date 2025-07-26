# Security Guidelines for Google Cloud Storage Integration

## 🔐 Service Account Key Storage

### ✅ RECOMMENDED APPROACHES

#### 1. **Environment Variables (Production)**
```bash
# Set these in your production environment
export GOOGLE_CLOUD_PROJECT_ID="your-project-id"
export GOOGLE_CLOUD_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
export GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
export GCS_BUCKET_NAME="your-bucket-name"
```

#### 2. **Local File (Development Only)**
```bash
# Place in config folder (already in .gitignore)
./config/gcs-service-account.json
```

### ❌ NEVER DO THIS

- ❌ **Don't commit key files to Git**
- ❌ **Don't store keys in public repositories**
- ❌ **Don't hardcode credentials in source code**
- ❌ **Don't share key files via email/chat**

## 🛡️ Security Best Practices

### Service Account Permissions
- Use **principle of least privilege**
- Only grant **Storage Admin** or **Storage Object Admin**
- Create separate service accounts for different environments

### Key Rotation
- Rotate service account keys regularly (every 90 days)
- Monitor key usage in Google Cloud Console
- Delete unused keys immediately

### Environment Security
- Use different service accounts for dev/staging/production
- Enable audit logging for storage operations
- Set up bucket-level IAM policies

## 🚀 Deployment Options

### Vercel/Netlify
```bash
# Add environment variables in dashboard
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GCS_BUCKET_NAME=your-bucket-name
```

### Docker
```dockerfile
# Use build args or runtime environment variables
ENV GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID}
ENV GOOGLE_CLOUD_CLIENT_EMAIL=${GOOGLE_CLOUD_CLIENT_EMAIL}
ENV GOOGLE_CLOUD_PRIVATE_KEY=${GOOGLE_CLOUD_PRIVATE_KEY}
ENV GCS_BUCKET_NAME=${GCS_BUCKET_NAME}
```

### Kubernetes
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcs-credentials
type: Opaque
stringData:
  project-id: "your-project-id"
  client-email: "your-service-account@your-project.iam.gserviceaccount.com"
  private-key: |
    -----BEGIN PRIVATE KEY-----
    ...
    -----END PRIVATE KEY-----
```

## 🔍 Security Checklist

- [ ] Service account key is not in version control
- [ ] `.gitignore` includes credential files
- [ ] Environment variables are used in production
- [ ] Service account has minimal required permissions
- [ ] Keys are rotated regularly
- [ ] Audit logging is enabled
- [ ] Bucket access is properly configured
- [ ] CORS settings are restrictive
- [ ] File upload limits are enforced
- [ ] File type validation is implemented

## 🚨 If Credentials Are Compromised

1. **Immediately disable** the service account key in Google Cloud Console
2. **Create a new** service account key
3. **Update all environments** with new credentials
4. **Review audit logs** for unauthorized access
5. **Rotate bucket access** if necessary
6. **Update security policies** to prevent future incidents