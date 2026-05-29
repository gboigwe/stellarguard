# StellarGuard Backend

NestJS-based backend API server and event listener for StellarGuard, providing REST endpoints for treasury management, governance, and token vault operations.

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Event Listener](#event-listener)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Architecture

The backend consists of two main components:

1. **API Server** - NestJS REST API serving endpoints for treasury, governance, and vault operations
2. **Event Listener** - Background service that polls Soroban RPC for contract events and updates the database

Both components share the same database and configuration.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- (Optional) Redis for caching
- Soroban RPC endpoint access

## Environment Variables

The backend requires several environment variables to be set. Copy `.env.example` to `.env` and configure:

### Required Variables

These variables MUST be set - the server will fail to start without them:

- `DATABASE_URL` - PostgreSQL connection string (format: `postgresql://user:password@host:port/database`)
- `SOROBAN_RPC_URL` - Soroban RPC endpoint URL
- `NETWORK_PASSPHRASE` - Stellar network passphrase

### Optional Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production, default: development)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated, default: http://localhost:3000)
- `POLL_INTERVAL_MS` - Event polling interval in milliseconds (default: 5000)
- `DB_POOL_MAX` - Database connection pool max size (default: 10)
- `API_KEYS` - Comma-separated API keys for write operations (empty in development)
- `TREASURY_CONTRACT_ID` - Treasury contract address
- `GOVERNANCE_CONTRACT_ID` - Governance contract address
- `TOKEN_VAULT_CONTRACT_ID` - Token vault contract address
- `ACCESS_CONTROL_CONTRACT_ID` - Access control contract address

See `.env.example` for detailed documentation of all variables.

## Local Development Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Set Up PostgreSQL

Ensure PostgreSQL is running and create the database:

```bash
createdb stellarguard
```

Or using Docker:

```bash
docker run -d \
  --name stellarguard-db \
  -e POSTGRES_USER=stellarguard \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=stellarguard \
  -p 5432:5432 \
  postgres:14
```

### 4. Run Database Migrations

```bash
npm run migrate
```

Or using the migration script:

```bash
./migrate.sh up
```

### 5. Start the API Server

```bash
npm run start:dev
```

The API server will start on `http://localhost:3001`

### 6. Start the Event Listener (Optional)

In a separate terminal:

```bash
npm run listener
```

This starts the background service that polls for contract events.

## API Endpoints

All endpoints are prefixed with `/api`. The API uses Swagger/OpenAPI documentation available at `/api` when running in development.

### Health Check

#### GET `/api/health`

Check API health and connectivity to database and Soroban RPC.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-29T02:19:00.000Z",
  "service": "stellarguard-api",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 5
    },
    "sorobanRpc": {
      "status": "ok",
      "responseTime": 120
    }
  }
}
```

### Treasury Endpoints

#### GET `/api/treasury/balance`

Get current treasury balance.

**Response:**
```json
{
  "balance": "10000000000"
}
```

#### GET `/api/treasury/config`

Get treasury configuration including admin and threshold.

**Response:**
```json
{
  "admin": "GABCD...",
  "threshold": 2
}
```

#### GET `/api/treasury/transactions?page=1&limit=10`

Get paginated list of treasury transactions.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "transactions": [
    {
      "id": "1",
      "treasury_id": "1",
      "to_address": "GABCD...",
      "amount": "10000000",
      "memo": "Payment",
      "status": "approved",
      "created_at": "2026-05-29T02:19:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### GET `/api/treasury/transactions/:id`

Get a specific transaction by ID.

**Response:**
```json
{
  "id": "1",
  "treasury_id": "1",
  "to_address": "GABCD...",
  "amount": "10000000",
  "memo": "Payment",
  "status": "approved",
  "approvals_json": ["GABCD...", "GEF..."],
  "created_at": "2026-05-29T02:19:00.000Z"
}
```

#### GET `/api/treasury/signers`

Get list of authorized treasury signers.

**Response:**
```json
{
  "signers": [
    {
      "address": "GABCD...",
      "weight": 1
    },
    {
      "address": "GEF...",
      "weight": 1
    }
  ]
}
```

### Governance Endpoints

#### GET `/api/governance/proposals?page=1&limit=10&status=open&action=transfer`

Get paginated list of governance proposals with optional filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status (e.g., open, passed, rejected)
- `action` - Filter by action type

**Response:**
```json
{
  "proposals": [
    {
      "id": "1",
      "title": "Transfer Funds",
      "description": "Transfer 100 XLM to treasury",
      "action": "transfer",
      "status": "open",
      "proposer": "GABCD...",
      "votes_for": 3,
      "votes_against": 1,
      "created_at": "2026-05-29T02:19:00.000Z",
      "ends_at": "2026-06-05T02:19:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET `/api/governance/proposals/:id`

Get a specific proposal by ID.

**Response:**
```json
{
  "id": "1",
  "title": "Transfer Funds",
  "description": "Transfer 100 XLM to treasury",
  "action": "transfer",
  "status": "open",
  "proposer": "GABCD...",
  "votes_for": 3,
  "votes_against": 1,
  "created_at": "2026-05-29T02:19:00.000Z",
  "ends_at": "2026-06-05T02:19:00.000Z"
}
```

#### GET `/api/governance/proposals/:id/votes`

Get votes for a specific proposal.

**Response:**
```json
{
  "votes": [
    {
      "voter": "GABCD...",
      "vote": "for",
      "timestamp": "2026-05-29T02:19:00.000Z"
    },
    {
      "voter": "GEF...",
      "vote": "against",
      "timestamp": "2026-05-29T02:20:00.000Z"
    }
  ]
}
```

#### GET `/api/governance/members`

Get list of governance members.

**Response:**
```json
{
  "members": [
    {
      "address": "GABCD...",
      "joined_at": "2026-05-01T00:00:00.000Z"
    },
    {
      "address": "GEF...",
      "joined_at": "2026-05-02T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/governance/config`

Get governance configuration including quorum and voting period.

**Response:**
```json
{
  "quorum": 3,
  "voting_period": 604800,
  "members": ["GABCD...", "GEF..."]
}
```

### Vault Endpoints

#### GET `/api/vault/locks?page=1&limit=10`

Get paginated list of token locks.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "locks": [
    {
      "id": "1",
      "owner": "GABCD...",
      "amount": "1000000000",
      "locked_at": "2026-05-29T02:19:00.000Z",
      "unlock_at": "2026-06-29T02:19:00.000Z",
      "claimed": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

#### GET `/api/vault/locks/:id`

Get a specific token lock by ID.

**Response:**
```json
{
  "id": "1",
  "owner": "GABCD...",
  "amount": "1000000000",
  "locked_at": "2026-05-29T02:19:00.000Z",
  "unlock_at": "2026-06-29T02:19:00.000Z",
  "claimed": false
}
```

#### GET `/api/vault/vestings?page=1&limit=10`

Get paginated list of vesting schedules.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "vestings": [
    {
      "id": "1",
      "beneficiary": "GABCD...",
      "total_amount": "10000000000",
      "claimed_amount": "0",
      "start_time": "2026-05-29T02:19:00.000Z",
      "duration": 2592000,
      "cliff": 604800
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

#### GET `/api/vault/vestings/:id`

Get a specific vesting schedule by ID.

**Response:**
```json
{
  "id": "1",
  "beneficiary": "GABCD...",
  "total_amount": "10000000000",
  "claimed_amount": "0",
  "start_time": "2026-05-29T02:19:00.000Z",
  "duration": 2592000,
  "cliff": 604800
}
```

#### GET `/api/vault/stats`

Get vault statistics.

**Response:**
```json
{
  "total_locked": "50000000000",
  "total_vested": "30000000000",
  "active_locks": 15,
  "active_vestings": 20
}
```

## Database Setup

### Database Schema

The backend uses PostgreSQL with the following main tables:

#### treasuries
- Stores treasury configurations and current balances
- Fields: id, admin, threshold, balance, created_at

#### transactions
- Stores multi-signature transactions requiring approvals
- Fields: id, treasury_id, to_address, amount, memo, status, approvals_json, created_at

#### proposals
- Stores governance proposals and voting results
- Fields: id, title, description, action, status, proposer, votes_for, votes_against, created_at, ends_at

#### token_locks
- Stores token lock positions for time-locked tokens
- Fields: id, owner, amount, locked_at, unlock_at, claimed

#### vesting_schedules
- Stores token vesting schedules for beneficiaries
- Fields: id, beneficiary, total_amount, claimed_amount, start_time, duration, cliff

#### events
- Stores contract events from Soroban
- Fields: id, topic_1, topic_2, event_name, event_topics, event_data, created_at

#### event_cursor
- Tracks the last processed event cursor for resumable polling
- Fields: cursor, updated_at

### Running Migrations

```bash
npm run migrate
```

Or using the migration script:

```bash
./migrate.sh up
```

To rollback migrations:

```bash
./migrate.sh down
```

### Database Notes

- All amounts are stored in stroops (1 XLM = 10,000,000 stroops)
- Addresses are stored as text (Stellar public keys)
- Timestamps use TIMESTAMP WITH TIME ZONE for UTC storage
- JSONB fields store structured data (proposal actions, transaction approvals)

## Event Listener

The event listener is a background service that polls the Soroban RPC for contract events and updates the database.

### Starting the Event Listener

```bash
npm run listener
```

### Configuration

The event listener uses the same configuration as the API server. Key configuration options:

- `POLL_INTERVAL_MS` - How often to poll for events (default: 5000ms)
- `contractIds` - List of contract IDs to monitor (from environment variables)

### How It Works

1. Polls Soroban RPC for new events from configured contracts
2. Parses event data and updates relevant database tables
3. Tracks the last processed cursor in the `event_cursor` table
4. Resumes from the last cursor on restart

### Troubleshooting Event Listener

- If events aren't appearing, check that contract IDs are configured
- Verify `SOROBAN_RPC_URL` is accessible
- Check logs for parsing errors
- Ensure database migrations have been run

## CORS Configuration

- Set `CORS_ORIGIN` to the allowed frontend origin, for example `http://localhost:3000` in local development.
- Multiple origins can be provided as a comma-separated list.
- If `NODE_ENV` is not `production`, the backend defaults to `http://localhost:3000`.
- If `NODE_ENV=production` and `CORS_ORIGIN` resolves to `*`, the server logs a startup warning because wildcard CORS is unsafe for production deployments.

## Testing

### Run Unit Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run E2E Tests

```bash
npm run test:e2e
```

## Troubleshooting

### Server won't start

**Problem:** Server exits with "DATABASE_URL is not set" error

**Solution:** Ensure `DATABASE_URL` is set in `.env` file. The server now requires all critical environment variables to be explicitly set.

**Problem:** Server exits with "SOROBAN_RPC_URL is not set" error

**Solution:** Ensure `SOROBAN_RPC_URL` is set in `.env` file.

**Problem:** Server exits with "NETWORK_PASSPHRASE is not set" error

**Solution:** Ensure `NETWORK_PASSPHRASE` is set in `.env` file with the correct network passphrase for your network.

### Database connection issues

**Problem:** "Connection refused" when connecting to PostgreSQL

**Solution:** 
- Ensure PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format and credentials
- Verify database exists: `psql -l`

### Event listener not processing events

**Problem:** No events appearing in database

**Solution:**
- Verify contract IDs are configured in environment variables
- Check `SOROBAN_RPC_URL` is accessible
- Ensure `event_cursor` table exists (run migrations)
- Check logs for RPC errors

### CORS errors in frontend

**Problem:** Frontend gets CORS errors when calling API

**Solution:**
- Set `CORS_ORIGIN` to your frontend URL in `.env`
- For multiple origins, separate with commas: `http://localhost:3000,https://example.com`
- Avoid using `*` in production

### Configuration validation errors

**Problem:** Server exits with configuration validation errors

**Solution:** The server now validates configuration on startup. Check the error message for which variable is missing or invalid, and refer to `.env.example` for the correct format.

## Development Workflow

1. Make changes to source code in `src/`
2. Run `npm run start:dev` for hot-reload development
3. Write tests in `*.test.ts` files
4. Run `npm test` before committing
5. Update this README if you add new endpoints or change configuration
