# Elitespan

## GitHub Actions CI/CD Setup

1. **Create GitHub Secrets**:
   Navigate to your GitHub repository → Settings → Secrets and Variables → Actions  
   Add every server and client env here, along with credentials for EC2 and Docker Hub.  
   Add the following secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_REGION`
   - `AWS_S3_BUCKET_NAME`
   - `AWS_S3_BUCKET_URL`
   - `AWS_SECRET_ACCESS_KEY`
   - `DOCKER_PASSWORD`
   - `DOCKER_USERNAME`
   - `DOMAIN_NAME`
   - `EC2_HOST`
   - `EC2_USERNAME`
   - `EMAIL_SERVICE`
   - `JWT_SECRET`
   - `MONGO_URI`
   - `SSH_PRIVATE_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPPORT_EMAIL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
