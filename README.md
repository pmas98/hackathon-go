# BIX Data Integrity

Complete system for CSV data validation and comparison with product API, developed for the BIX hackathon.

## 🏗️ Architecture

The project consists of:

- **Backend**: REST API in Go with WebSocket for real-time progress
- **Frontend**: Modern web interface in React + TypeScript
- **Infrastructure**: Docker Compose for development

## 🚀 How to Run

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd hackathon-go

# Run with Docker Compose
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

### Option 2: Local Development

#### Backend
```bash
# In the root folder
go mod download
go run cmd/server/main.go
```

#### Frontend
```bash
# In the frontend folder
cd frontend
npm install
npm run dev
```

## 📋 Features

### ✅ CSV Validation
- **Client-side validation** in Web Worker (doesn't freeze the UI)
- **Complete rules** for all fields
- **Visual feedback** in real-time
- **Download CSV with errors** for correction

### 🔄 Processing
- **Secure upload** with prior validation
- **Real-time progress** via WebSocket
- **Asynchronous processing** in backend
- **Efficient comparison** with external API

### 📊 Results Analysis
- **Interactive dashboard** with metrics
- **Virtualized table** for large datasets
- **Advanced filters** by type, category, price, stock
- **Export** in CSV and JSON
- **Shareable links** with filters

### 📈 Performance
- **Detailed metrics** of processing time
- **Optimizations** for large datasets
- **Smart cache** of results
- **Real-time monitoring**

## 🛠️ Technologies

### Backend (Go)
- **Gin** - Web framework
- **Redis** - Cache and temporary storage
- **Goroutines** - Concurrency
- **WebSocket** - Real-time communication

### Frontend (React)
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** + shadcn/ui - Design system
- **React Router** - Navigation
- **Web Workers** - Asynchronous validation
- **WebSocket** - Real-time updates

## 📁 Project Structure

```
hackathon-go/
├── cmd/server/          # Backend entry point
├── internal/            # Business logic
│   ├── api/            # External API client
│   ├── comparison/     # Comparison logic
│   ├── csv/            # CSV parser
│   ├── models/         # Data structures
│   ├── storage/        # Redis client
│   └── ws/             # WebSocket hub
├── pkg/handler/        # HTTP handlers
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Application pages
│   │   ├── lib/        # Utilities and hooks
│   │   ├── workers/    # Web Workers
│   │   └── styles/     # Global styles
│   └── public/         # Static files
├── docker-compose.yml  # Docker configuration
└── README.md           # This file
```

## 🔍 CSV Validation

### Validated Fields
- **ID**: Non-negative integer
- **Name**: Non-empty string
- **Category**: One of the valid options
- **Price**: Number with maximum 2 decimal places
- **Stock**: Integer between 0 and 500
- **Supplier**: Non-empty string

### Valid Categories
- Furniture
- Hardware
- Accessories
- Components
- Peripherals

## 🌐 API Endpoints

### Backend
- `POST /upload` - CSV file upload
- `GET /results/:job_id` - Comparison results
- `GET /jobs` - Jobs list
- `GET /ws/:job_id` - WebSocket for progress

### Frontend
- `/` - Upload and validation page
- `/job/:jobId` - Progress tracking
- `/results/:jobId` - Results visualization
- `/jobs` - Jobs history

## 📊 Usage Flow

1. **Upload and Validation**
   - User drags/selects CSV file
   - Automatic validation in Web Worker
   - Error visualization with details
   - Download CSV with errors for correction

2. **Processing**
   - Upload of validated file
   - Real-time tracking via WebSocket
   - Detailed status of each step
   - Automatic redirect to results

3. **Analysis**
   - Dashboard with main metrics
   - Interactive table with filters
   - Divergence charts
   - Data export
   - Shareable links

## 🎯 Differentiators

### Performance
- **Asynchronous validation** without freezing the UI
- **Virtualized table** for large datasets
- **Chunk processing** for efficiency
- **Smart cache** of results

### UX/UI
- **Modern design** with Tailwind CSS
- **Real-time feedback** via WebSocket
- **Intuitive navigation** between pages
- **Responsiveness** for all devices

### Features
- **Robust validation** of all fields
- **Advanced filters** and search
- **Flexible export** in multiple formats
- **Complete history** of jobs

## 🚀 Deployment

### Production
```bash
# Frontend build
cd frontend
npm run build

# Backend build
go build -o bin/server cmd/server/main.go

# Run with environment variables
REDIS_ADDR=localhost:6379 ./bin/server
```

### Docker
```bash
# Build images
docker-compose build

# Run in production
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Metrics and Monitoring

### Frontend
- Validation time (client-side)
- Total process time
- Rendering performance
- Memory usage

### Backend
- Processing time per step
- Number of processed products
- Success/error rate
- Resource usage

## 🔧 Development

### Backend
```bash
# Install dependencies
go mod download

# Run tests
go test ./...

# Run with hot reload
air
```

### Frontend
```bash
# Install dependencies
cd frontend
npm install

# Run in development
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## 📄 License

This project was developed for the BIX Data Integrity hackathon.

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For questions or issues, open an issue in the repository. 
