# Farmified Backend

Backend server for the Farmified application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5001` (port 5000 is often used by macOS AirPlay)

## API Endpoints

### POST /api/signup
Register a new user.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "location": "Nebraska",
  "password": "Password123!",
  "userType": "farmer",
  "farmName": "Doe Farm",
  "crops": ["Corn", "Soybeans"],
  "farmSize": "100"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": { ... }
}
```

### POST /api/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... }
}
```

### GET /api/user/:id
Get user information by ID.

## Database

The application uses SQLite database stored in `database.sqlite`. The database is automatically created when the server starts.

