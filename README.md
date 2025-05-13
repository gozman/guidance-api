# Instructions API

A simple REST API built with Node.js and Express that uses the Browserbase SDK with Playwright for managing custom instructions.

## Features

- RESTful API endpoints for custom instructions management
- Browserbase SDK integration for browser automation
- Session recording and replay via Browserbase

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Browserbase API key and project ID

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd guidance-api
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Create a `.env` file based on `.env.example` and add your Browserbase API key and project ID:
   ```
   PORT=3000
   NODE_ENV=development
   BROWSERBASE_API_KEY=your_api_key_here
   BROWSERBASE_PROJECT_ID=your_project_id_here
   AUTH_USERNAME=your_username_here
   AUTH_PASSWORD=your_password_here
   ```

## Usage

### Starting the server

```
npm start
```

or for development with auto-restart:

```
npm run dev
```

### API Endpoints

#### GET /

Returns information about the API and available endpoints.

#### GET /instructions

Retrieves a list of instructions.

**Query Parameters:**

```
username: Your login username (optional - uses AUTH_USERNAME from .env if not provided)
password: Your login password (optional - uses AUTH_PASSWORD from .env if not provided)
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "title": "Always talk like a pirate",
      "status": "Active",
      "lastModified": "May 13, 2025"
    },
    {
      "title": "Be concise",
      "status": "Inactive",
      "lastModified": "May 12, 2025"
    }
  ]
}
```

#### POST /instructions

Creates a new instruction.

**Request Body:**

```json
{
  "username": "your_username", // Optional - uses AUTH_USERNAME from .env if not provided
  "password": "your_password", // Optional - uses AUTH_PASSWORD from .env if not provided
  "title": "Instruction title",
  "content": "Instruction content"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Instruction \"Instruction title\" created successfully",
  "sessionId": "session-id",
  "sessionUrl": "https://browserbase.com/sessions/session-id"
}
```

#### POST /instructions/delete

Deletes an instruction.

**Request Body:**

```json
{
  "username": "your_username", // Optional - uses AUTH_USERNAME from .env if not provided
  "password": "your_password", // Optional - uses AUTH_PASSWORD from .env if not provided
  "title": "Instruction title" // Optional - if not provided, all instructions will be deleted
}
```

**Response:**

```json
{
  "success": true,
  "message": "Instruction \"Instruction title\" deleted successfully",
  "sessionId": "session-id",
  "sessionUrl": "https://browserbase.com/sessions/session-id"
}
```

## Environment Variables

- `PORT`: The port on which the server will run (default: 3000)
- `BROWSERBASE_API_KEY`: Your Browserbase API key
- `BROWSERBASE_PROJECT_ID`: Your Browserbase project ID
- `AUTH_USERNAME`: Default username for authentication
- `AUTH_PASSWORD`: Default password for authentication

## Architecture

### Browserbase SDK Integration

The API uses the Browserbase SDK with Playwright for all browser automation tasks. The Browserbase SDK creates a session, and then Playwright connects to that session using CDP (Chrome DevTools Protocol). This approach provides several benefits:

1. **Session Recording**: All browser sessions are recorded and can be replayed in the Browserbase dashboard
2. **Debugging**: Easier debugging of automation scripts through session replays
3. **Stability**: More stable browser automation through Browserbase's infrastructure

### Services

- **InstructionsService (`src/services/instructions-service.js`)**: Manages custom instructions through browser automation using the Browserbase SDK with Playwright

## Error Handling

The API includes error handling for:
- Missing credentials
- Browser automation errors
- Server errors

## License

ISC
