# Todo Calendar Web App

A modern web application for managing daily to-do lists and calendar events with a clean black and white design.

## Features

- Create, read, update, and delete to-do items
- Calendar view of your tasks
- Day-by-day task management
- REST API backend
- Docker containerization for easy deployment

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Using Docker Compose (Recommended)

1. Clone the repository
2. Navigate to the project root
3. Run:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

### Manual Setup

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:date` - Get tasks for a specific date
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Project Structure

```
todo-calendar-app/
├── backend/           # Node.js/Express API
├── frontend/          # HTML/CSS/JS frontend
├── docker-compose.yml
└── README.md
```
