# TestRail Viewer

A lightweight web application for viewing TestRail test cases and reports with integrated PDF viewing capabilities.

## Features

- **Test Case Viewing**: Display detailed TestRail test cases with formatted content
- **Report Generation**: Access and run TestRail reports 
- **PDF Integration**: View PDF reports directly in the browser using multiple fallback methods
- **Responsive Design**: Bootstrap-based UI that works on desktop and mobile
- **Docker Ready**: Containerized for easy deployment on EC2 or any Docker environment

## Project Structure

```
testrailviewer/
├── server.js              # Express.js backend server (main entry point)
├── package.json           # Node.js dependencies and scripts
├── Dockerfile             # Docker container configuration
├── docker-compose.yml     # Docker Compose for development
├── deploy.sh              # EC2 deployment script
├── .env.example           # Environment variables template
├── .dockerignore          # Docker ignore rules
└── public/                # Static frontend files
    ├── index.html         # Main HTML page
    ├── script.js          # JavaScript functionality
    └── style.css          # CSS styling
```


1. **Entry Point**: Node.js looks for the main file in the root directory
2. **package.json**: Defines `"main": "server.js"` or `"start": "node server.js"`
3. **Docker**: The Dockerfile copies `server.js` from the root
4. **Simplicity**: For smaller projects, there's no need for subfolders

## Quick Start

### 1. Environment Setup

Copy the environment template and configure your TestRail credentials:

```bash
cp .env.example .env
```

Edit `.env` with your TestRail settings:

```env
TESTRAIL_URL=https://your-company.testrail.com
TESTRAIL_API_USER=your-email@company.com
TESTRAIL_API_KEY=your-api-key
NODE_ENV=production
```

### 2. Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t testrailviewer .
docker run -d -p 3000:3000 --env-file .env testrailviewer
```

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` to access the application.

## API Endpoints

- `GET /api/case/:id` - Retrieve a specific test case
- `GET /api/reports/:projectId` - Get available reports for a project
- `GET /api/report/run/:reportId` - Execute a specific report
- `GET /api/pdf-proxy` - Proxy PDF files with authentication
- `GET /health` - Health check endpoint

## EC2 Deployment

1. Update `deploy.sh` with your EC2 details:
   - SSH key path
   - EC2 instance IP
   - Any custom configuration

2. Run deployment:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, Bootstrap 5, Font Awesome
- **Containerization**: Docker, Docker Compose
- **Deployment**: EC2, Docker

## Security Features

- Environment-based configuration
- CORS protection
- Non-root Docker user
- Input validation
- Secure TestRail API authentication

## Health Monitoring

The application includes built-in health checks:
- Docker healthcheck endpoint at `/health`
- Monitoring for service availability
- Automatic restart policies in Docker Compose

## License

MIT License - see LICENSE file for details.