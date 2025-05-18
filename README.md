# Elitespan

# Deployment Guide: AWS EC2 with Nginx, Docker hub

This guide will walk you through the complete setup process for deploying this project on AWS EC2 using Docker Compose, Nginx as a reverse proxy, and Cloudflare for DNS and security.

(Tested and deployed on : https://nawinsharma.com.np
for now)

## Table of Contents

1. [AWS EC2 Instance Setup](#aws-ec2-instance-setup)
2. [SSH Configuration](#ssh-configuration)
3. [Docker Installation](#docker-installation)
4. [Application Deployment](#application-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [Cloudflare Setup](#cloudflare-setup)
7. [GitHub Actions CI/CD Setup](#github-actions-cicd-setup)

## AWS EC2 Instance Setup

1. **Login to AWS Console**:
   - Navigate to EC2 Dashboard
   - Click "Launch Instance"

2. **Instance Configuration**:
   - Choose Ubuntu Server 22.04 LTS
   - Select t2.micro (free tier) or other suitable instance type
   - Configure security groups:
     - SSH (Port 22): Your IP or specific IPs
     - HTTP (Port 80): Anywhere
     - HTTPS (Port 443): Anywhere

3. **Create or select key pair**:
   - Download your key pair (.pem file)
   - Secure your key pair file: `chmod 400 your-key-pair.pem`

4. **Launch the instance and note its public IP**

## SSH Configuration

1. **Connect to your instance**:
   ```bash
   ssh -i /path/to/your-key-pair.pem ubuntu@your-instance-public-ip
   ```

2. **Update system packages**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Docker Installation

1. **Install Docker**
2. **Install Docker Compose**:

## Application Deployment

1. **Create project directory**:
   ```bash
   mkdir -p ~/app/server
   cd ~/app
   ```

2. **Create docker-compose.yml file**:
   ```bash
   nano docker-compose.yml
   ```

3. **Add the following content**:
   copy from the repository, replace docker image tag with your own

4. **Create .env file**:
   ```bash
   nano server/.env
   ```

5. **Add environment variables**:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/doctor_directory
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   WAITLIST_EMAIL=recipient@example.com

   # AWS SES Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   EMAIL_SERVICE=ses

   # AWS S3 Configuration
   AWS_S3_BUCKET_NAME=your-bucket-name
   AWS_S3_BUCKET_URL=https://your-bucket-name.s3.region.amazonaws.com

   # Stripe Configuration
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Admin Credentials
   ADMIN_EMAIL=admin@gmail.com
   ADMIN_PASSWORD=password
   ```

6. **Start the application**:
   ```bash
   docker-compose up -d
   ```

## Nginx Configuration

1. **Install Nginx**:
   ```bash
   sudo apt install nginx -y
   ```

2. **Create Nginx configuration for your domain**:
   ```bash
   sudo nano /etc/nginx/sites-available/yourdomain.com
   ```

3. **Add the following configuration**:
   ```nginx
   # HTTP server (will redirect to HTTPS)
   server {
     listen 80;
     server_name yourdomain.com www.yourdomain.com;
     
     # Proxy settings for React app
     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }

     # Proxy settings for API
     location /api {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
   reload everytime after doing any changes to nginx configuration

## Cloudflare Setup

1. **Create a Cloudflare account** (if you don't have one)

2. **Add your domain to Cloudflare**:
   - Enter your domain name
   - Cloudflare will scan your existing DNS records
   - Update your domain nameservers to point to Cloudflare's nameservers

3. **Configure DNS settings**:
   - Add an A record pointing to your EC2 instance's public IP:
     - Type: A
     - Name: @ (root domain)
     - Content: Your EC2 IP address
     - Proxy status: Proxied (Orange cloud)
   
   - Add a CNAME record for www subdomain:
     - Type: CNAME
     - Name: www
     - Content: yourdomain.com
     - Proxy status: Proxied (Orange cloud)

4. **Configure SSL/TLS settings**:
   - Navigate to SSL/TLS section
   - Set SSL/TLS encryption mode to "Flexible" or "Full"
   - Enable "Always Use HTTPS" in the Edge Certificates section

## GitHub Actions CI/CD Setup

1. **Create GitHub Secrets**:
   Navigate to your GitHub repository → Settings → Secrets and Variables → Actions
   
   Add the following secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_REGION`
   - `AWS_S3_BUCKET_NAME`
   - `AWS_S3_BUCKET_URL`
   - `AWS_SECRET_ACCESS_KEY`
   - `DOCKER_PASSWORD`
   - `DOCKER_USERNAME`
   - `EC2_HOST`
   - `EC2_USERNAME`
   - `EMAIL_SERVICE`
   - `JWT_SECRET`
   - `MONGO_URI`
   - `SSH_PRIVATE_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `VITE_BASE_URL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

2. **Create GitHub Actions workflow file**: (in the repo)
   
3. **Commit and push** to main branch to trigger deployment

Remember to replace placeholder values like `yourdomain.com`, `your_jwt_secret`, etc., with your actual configuration values. Also update Docker Hub registry names if you're using your own Docker Hub account.