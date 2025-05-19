# Location Tracking API

A RESTful API service built with Express.js, Prisma ORM, and Swagger documentation for storing location tracking data in a PostgreSQL database.

## Features

- RESTful API endpoint for storing location tracking data
- Prisma ORM integration with PostgreSQL database
- Interactive Swagger documentation UI for API testing and exploration
- Data validation and error handling
- Environment variable management for secure database connection

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database (Neon PostgreSQL is used in this project)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Rename `.env.example` to `.env` if needed
   - Update the `DATABASE_URL` with your PostgreSQL connection string

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run database migrations:

```bash
npx prisma migrate dev
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The server will start at http://localhost:3000

API documentation will be available at http://localhost:3000/api-docs

## API Endpoints

### POST /api/location

Save location tracking data to the database.

**Request Body:**

```json
{
  "accuracy": 3.9,
  "altitude": 198,
  "bearing": 201,
  "deviceRDT": "30/01/2025 02:04:27.703",
  "emailAddress": "email",
  "gmtSettings": "GMT+05:00 2025",
  "igStatus": 1,
  "imei": "865632050026800",
  "latitude": 31.3025483,
  "localPrimaryId": 10253,
  "longitude": 74.0778433,
  "name": "865632050026800",
  "phoneNo": "TST123",
  "provider": "fused",
  "reason": "Turn",
  "speed": 95,
  "time": 1738227867703,
  "versionNo": "v 250111"
}
```

### GET /api/location

Get all location tracking data from the database.

## License

MIT