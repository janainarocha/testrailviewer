# Use official Node.js image
FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S testrailviewer -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Change ownership of the app directory
RUN chown -R testrailviewer:nodejs /app

# Switch to non-root user
USER testrailviewer

# Copy package files and install dependencies
COPY --chown=testrailviewer:nodejs package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY --chown=testrailviewer:nodejs server.js ./
COPY --chown=testrailviewer:nodejs .env.example ./
COPY --chown=testrailviewer:nodejs public/ ./public/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
