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
