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

### POST /api/forgot-password
Request password recovery. Sends a new password to the user's email address.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Password has been sent to your email address."
}
```

## Email Configuration

The forgot password feature requires email configuration. You have two options:

### Option 1: Using Environment Variables (Recommended)

Create a `.env` file in the `backend` directory with:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Gmail Setup:**
1. Enable 2-Step Verification on your Google account: https://myaccount.google.com/security
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app and "Other" as the device
   - Enter "Farmified" as the name
   - Click "Generate"
   - Copy the 16-character password (no spaces)
3. Use that App Password as `SMTP_PASS` in your `.env` file
   - **Important:** Use the App Password, NOT your regular Gmail password

### Option 2: Set Environment Variables Directly

**Windows (PowerShell):**
```powershell
$env:SMTP_USER="your-email@gmail.com"
$env:SMTP_PASS="your-app-password"
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
npm start
```

**Windows (Command Prompt):**
```cmd
set SMTP_USER=your-email@gmail.com
set SMTP_PASS=your-app-password
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
npm start
```

**Mac/Linux:**
```bash
export SMTP_USER=your-email@gmail.com
export SMTP_PASS=your-app-password
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
npm start
```

### Testing Email Configuration

After setting up, restart your server. You should see:
- `✅ Email configured successfully` if configured correctly
- `⚠️ Email not configured...` if not configured

### Alternative Email Services

You can use other email services by changing the SMTP settings:
- **Mailtrap** (for testing - emails don't actually send): https://mailtrap.io
- **SendGrid**: https://sendgrid.com
- **AWS SES**: https://aws.amazon.com/ses/
- **Outlook/Hotmail**: Use `smtp-mail.outlook.com` on port 587

## Database

The application uses SQLite database stored in `database.sqlite`. The database is automatically created when the server starts.

