# Automatic synchronization of TestRail test cases

To schedule a weekly synchronization of TestRail test cases to the SQLite database, use cron on Linux/Unix:

```
0 3 * * 1 cd /path/to/your/testrailviewer && npm run sync:testrail
```

This example runs every Monday at 3am. Adjust the schedule as needed.

You can also run it manually:

```
npm run sync:testrail
```
# TestRail Viewer

A professional, modular web application for viewing TestRail test cases, running reports, and searching user stories with a modern three-tab interface.

## Features

- **Test Case Tab**: Display detailed TestRail test cases with formatted content, custom fields, and preconditions
- **Reports Tab**: Access and run fixed TestRail reports with centralized configuration
- **Search US Tab**: Search user stories across project suites with real-time filtering
- **Modular Architecture**: ES6 modules, DRY principles, and clean separation of concerns
- **Responsive Design**: Bootstrap-based UI that works on desktop and mobile
- **Docker Ready**: Containerized for easy deployment with config validation

## Project Structure

```
testrailviewer/
├── src/                     # Source code
│   ├── server.js           # Express.js backend server (main entry point)
│   ├── config.js           # Centralized config with validation
│   ├── routes/             # API route definitions (modular)
│   │   └── api.js          # API endpoints (cases, reports)
│   ├── controllers/        # Route controllers (business logic)
│   │   └── reportController.js # Report endpoints logic
│   ├── middlewares/        # Express middlewares (validation, error handling)
│   │   └── validate.js     # Request validation helpers
│   ├── services/           # Service layer (TestRail integration)
│   │   └── testrailService.js # TestRail API logic
│   ├── database/           # Database related files
│   │   └── fetch_testrail_cases.js # SQLite sync script
│   └── utils/              # Shared utilities
├── public/                 # Static frontend files
│   ├── index.html          # Main HTML page
│   ├── style.css           # CSS styling
│   └── modules/            # ES6 modules (frontend logic)
│       ├── api.js          # API calls to backend
│       ├── state.js        # State/config management
│       ├── ui.js           # UI rendering helpers
│       ├── utils.js        # Utility functions
│       └── main.js         # Main entry point (orchestrates tabs)
├── package.json            # Node.js dependencies and scripts
├── Dockerfile              # Docker container configuration
├── docker-compose.yml      # Docker Compose for development
├── .env.example            # Environment variables template
└── README.md               # This file
```

- **Backend**: Modular Express.js with config validation, controllers, services, and middlewares
- **Frontend**: ES6 modules, centralized state management, no data duplication
- **Config**: Automatic validation of essential environment variables at startup
- **Architecture**: Clean separation between backend API and frontend modules
- **Security**: CORS protection, environment variables, non-root Docker user
- **Maintainability**: DRY principles, modular design, and professional code structure

## Application Structure

The application features three main tabs:
1. **Test Case Tab**: Load and display individual test cases by ID
2. **Reports Tab**: Execute predefined reports for Ivision and Fastlane projects
3. **Search US Tab**: Search user stories across project suites with advanced filtering

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

- `GET /api/case/:id` — Retrieve a specific test case by ID
- `GET /api/fixed-reports` — Get all fixed reports (centralized, no duplicidade)
- `GET /api/report/run/:reportId` — Execute a specific report and get results
- `GET /api/suites/:projectId` — List all suites for a project
- `GET /api/cases/:projectId/:suiteId` — List all cases for a suite in a project
- `GET /api/pdf-proxy` — Proxy PDF files with authentication
- `GET /health` — Healthcheck endpoint for container monitoring

**All endpoints include input validation and error handling. Config validation ensures startup fails fast if required environment variables are missing.**

## Development Features

- **Modular Frontend**: ES6 modules for api.js, state.js, ui.js, utils.js, and main.js
- **Centralized State**: No duplication of fixed data between frontend and backend
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive UI**: Three-tab interface that works on all devices
- **Code Quality**: DRY principles, proper separation of concerns, and maintainable structure

## Technology Stack

### Backend
- **Node.js & Express.js**: RESTful API with modular architecture
- **Config Validation**: Automatic validation of required environment variables
- **Service Layer**: Dedicated TestRail API integration with error handling
- **Middleware**: Request validation and centralized error handling
- **CORS**: Cross-origin resource sharing enabled

### Frontend
- **ES6 Modules**: Clean, modular JavaScript architecture
- **State Management**: Centralized configuration and project management
- **API Integration**: Complete separation from backend, no data duplication
- **UI Components**: Responsive Bootstrap 5 interface with Font Awesome icons
- **Three-Tab Interface**: Test cases, reports, and user story search

### Architecture Principles
- **DRY (Don't Repeat Yourself)**: Eliminated code duplication across modules
- **Separation of Concerns**: Clear boundaries between API, UI, state, and utilities
- **Centralized Configuration**: Fixed data (reports, projects) managed in backend only
- **Modular Design**: Independent modules for maintainability and testing

### Containerization & DevOps
- Docker
- Docker Compose
- Integrated healthcheck (`/health`)
- Automatic restart via Docker Compose

### Security
- Environment-based configuration
- CORS protection
- Non-root user in container

### License
- MIT License - see LICENSE file