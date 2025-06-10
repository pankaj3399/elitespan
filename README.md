# Elitespan

## GitHub Actions CI/CD Setup

1. **Create GitHub Secrets**:
   Navigate to your GitHub repository → Settings → Secrets and Variables → Actions  
   Add every server and client env here, along with credentials for EC2 and Docker Hub.  
   Add the following secrets:

   - `AWS_ACCESS_KEY_ID`
   - `AWS_REGION`
   - `AWS_S3_BUCKET_NAME`
   - `AWS_SECRET_ACCESS_KEY`
   - `DOCKER_PASSWORD`
   - `DOCKER_USERNAME`
   - `DOMAIN_NAME`
   - `EC2_HOST`:`13.203.222.192`
   - `EC2_USERNAME`: `ubuntu`
   - `EMAIL_SERVICE`: `sendgrid`
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `JWT_SECRET`
   - `MONGO_URI`
   - `SSH_PRIVATE_KEY`:

   ```
         -----BEGIN RSA PRIVATE KEY-----
      MIIEpAIBAAKCAQEArXcG/7D1P2MjU0ZcXfklS7o8I5k/JFxnmZPTtc9sX9LdJKlG
      QG7UogHgXklU/3mY3LvskUAKm9/zFQ+4XKtvMz+4KgAzK7OgqHg9TG2E+PJK8vWr
      lRVFzG4jdr3bcsq45PoC2W+6hCMXW6qQ5Eosw+FGoJDeaS/GB9iVqcoGbz+k1s1j
      ...
      0ZmQ6+7BN2L7wU/oXZvIqI8Dk9HyE4uUszVvF6VZ/BCm0+z6H8gkQ3a+jow5nHXa
      lNaVYZU65MP8pKGeP7MGfExOANlQ3iOZJLZK4YwIDAQABAoIBAQCO7IbKrP7R9xwZ
      ...
      -----END RSA PRIVATE KEY-----

   ```

   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPPORT_EMAIL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`

## AWS EC2 Setup and Deployment

### 1. Launch EC2 Instance

1. Log in to AWS Console and navigate to EC2
2. Click "Launch Instance"
3. Configure the instance:
   - Name: `elitespan`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (or your preferred size)
   - Key pair: Create new or use existing (pem file should be stored in github secret in SSH_PRIVATE_KEY field)
   - Network settings: Allow HTTP (80), HTTPS (443), and SSH (22)

### 2. Configure Security Group

1. Create a new security group or modify existing:
   - Allow inbound SSH (22) from your IP
   - Allow HTTP (80) from anywhere
   - Allow HTTPS (443) from anywhere
   - Allow custom TCP (3000) for Node.js app

### 3. DNS Configuration

1. Go to your domain registrar's DNS management page
2. Add an A record:

   - Type: A
   - Name: @ (or your subdomain)
   - Value: Your EC2 instance's public IP
   - TTL: default

3. Add a CNAME record for www:
   - Type: CNAME
   - Name: www
   - Value: your-domain.com
   - TTL: default

### 4. Install docker and docker-compose on ec2 (One-Time Setup on EC2):

To make your GitHub Actions CI/CD flow work **successfully on EC2**, you only need to **manually install Docker and Docker Compose once** before your first deployment.

#### 🔧 Here's What You Need to Do (One-Time Setup)

You can SSH into your EC2 :

Here’s how to **SSH into your EC2 instance directly from the AWS dashboard (GUI)** using the **“Connect”** option:

#### Steps to Connect via AWS EC2 Dashboard:

1. **Go to EC2 Dashboard:**

   - Visit: [https://console.aws.amazon.com/ec2](https://console.aws.amazon.com/ec2)

2. **Click “Instances”** in the left sidebar.

3. **Select your EC2 instance** by clicking the checkbox next to it.

4. **Click the “Connect” button** at the top.

5. In the **Connect to instance** page:

   - Select the **“EC2 Instance Connect (browser-based SSH)”** tab (it's selected by default).
   - Leave default username (e.g., `ec2-user` for Amazon Linux or `ubuntu` for Ubuntu).
   - Click the **orange “Connect”** button at the bottom.

6. A new browser tab will open with a terminal session to your instance.

#### after this, run these commands in the console(browser-based) one by one :

```bash
# 1. Update package list
sudo apt update

# 2. Install Docker
sudo apt install -y docker.io

# 3. Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker


# You'll need to re-login or run: newgrp docker

# 5. Install Docker Compose
DOCKER_COMPOSE_VERSION="2.24.0"  # Check https://github.com/docker/compose/releases for latest
sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

# 6. Confirm installation
docker --version
docker-compose --version
```
