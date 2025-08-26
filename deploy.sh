#!/bin/bash

# EC2 Deploy Script for TestRail Viewer
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment to EC2..."

# Build and tag the Docker image
echo "📦 Building Docker image..."
docker build -t testrailviewer:latest .

# Save image to tar file for transfer
echo "💾 Saving image for transfer..."
docker save testrailviewer:latest | gzip > testrailviewer.tar.gz

# Copy to EC2 (adjust SSH key and IP)
echo "📤 Transferring to EC2..."
# scp -i ~/.ssh/your-key.pem testrailviewer.tar.gz ec2-user@your-ec2-ip:/home/ec2-user/

# SSH into EC2 and deploy
echo "🔧 Deploying on EC2..."
# ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-ip << 'EOF'
#   # Load the image
#   docker load < testrailviewer.tar.gz
#   
#   # Stop existing container
#   docker stop testrailviewer || true
#   docker rm testrailviewer || true
#   
#   # Run new container
#   docker run -d \
#     --name testrailviewer \
#     --restart unless-stopped \
#     -p 80:3000 \
#     -e TESTRAIL_URL="$TESTRAIL_URL" \
#     -e TESTRAIL_API_USER="$TESTRAIL_API_USER" \
#     -e TESTRAIL_API_KEY="$TESTRAIL_API_KEY" \
#     -e NODE_ENV=production \
#     testrailviewer:latest
#   
#   # Clean up
#   rm testrailviewer.tar.gz
#   
#   echo "✅ Deployment complete!"
# EOF

echo "📋 Manual deployment steps:"
echo "1. Configure your SSH key and EC2 IP in this script"
echo "2. Set environment variables on EC2"
echo "3. Run: ./deploy.sh"
echo "4. Access your app at http://your-ec2-ip"
