# Banao Backend

Banao Backend is a TypeScript REST API built with [NestJS](https://nestjs.com/). It currently contains identity and notification features and uses PostgreSQL with PostGIS through Prisma ORM 7. The code is organized by feature, with presentation, application, domain, and infrastructure layers inside the feature modules.

## Stack

- Node.js and TypeScript
- NestJS 11, with Swagger/OpenAPI documentation
- PostgreSQL with PostGIS
- Prisma ORM 7 and the PostgreSQL driver adapter
- JWT authentication, Argon2 password hashing, and OTP verification
- SMTP email delivery with Pug templates

## Getting started

### Requirements

- Node.js and npm
- Docker and Docker Compose (if running the included database container)
- A PostgreSQL/PostGIS database

### Install and configure

```bash
npm install
```

Copy `.env.example` to `.env` and provide values for the database, JWT, OTP, and SMTP settings. Keep secrets in `.env`; do not commit them.

Start the included PostgreSQL/PostGIS service:

```bash
docker compose up -d postgres
```

The database container uses `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` to create its database. Set `DATABASE_URL` to a connection string for that database, for example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/banao?schema=public"
```

The example credentials are for local development only. Use credentials appropriate to your environment.

### Database schema

Prisma configuration is in `prisma7.config.ts`. Schema files are in `src/infrastructure/prisma/schema/`, and migrations are in `src/infrastructure/prisma/migrations/`.

```bash
# Generate the Prisma client after changing the schema
npx prisma generate

# Apply migrations and create a new migration during development
npx prisma migrate dev --name describe-your-change
```

### Run the API

```bash
# Development
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

The API listens on port `3000` by default. Set `PORT` to change it. Swagger UI is available at `/api/docs`.

## Configuration

See `.env.example` for the complete list of environment variables.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000` |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Credentials and database name for the Compose database |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Access and refresh token lifetimes |
| `OTP_SECRET`, `EXPIRY_MINUTES` | OTP signing/hash secret and verification lifetime |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | SMTP server connection settings |
| `SMTP_SECURE` | Whether SMTP uses a secure connection (`true` or `false`) |
| `MAIL_FROM` | Sender address used for outgoing mail |

## Project structure

```text
src/
├── main.ts                         # NestJS bootstrap, Swagger setup, and HTTP listener
├── app.module.ts                   # Root module and global configuration
├── app.controller.ts               # Root endpoint
├── app.service.ts                  # Root service
├── module/
│   ├── identity/                   # Registration, login, tokens, and authorization
│   │   ├── presentation/           # Controllers, DTOs, guards, and decorators
│   │   ├── application/            # Auth/registration services, strategies, and ports
│   │   ├── domain/                 # User entity and repository contract
│   │   └── infrastructure/         # Prisma repository, JWT, hashing, and OTP adapters
│   ├── notification/               # Notification use case and email delivery
│   │   ├── application/            # Notification ports, use case, commands, and events
│   │   └── infrastructure/         # SMTP adapter, event listener, renderer, and Pug templates
│   └── shared/                     # Shared transaction, repository, and HTTP response types
└── infrastructure/
    └── prisma/                     # Prisma client, service, adapter, schema, and migrations
        ├── schema/                 # Split Prisma model definitions
        ├── migrations/             # Database migration history
        ├── extensions/             # Prisma client extensions, including soft delete
        └── generated/prisma/       # Generated Prisma client (do not edit by hand)

test/                               # End-to-end test setup
```

Feature modules use layered folders: `presentation` handles HTTP input and access control; `application` coordinates use cases and defines ports; `domain` contains core models and contracts; and `infrastructure` implements those contracts with external services and persistence.

## API areas

- **Identity:** registration for customers, providers, and employees; login and token handling; registration OTP verification; JWT authentication and authorization.
- **Notifications:** event-driven registration email delivery through SMTP and Pug templates.
- **Persistence:** Prisma-backed PostgreSQL access, transaction management, and soft-delete support.

## Useful commands

```bash
npm run build       # Compile the application
npm run lint        # Run ESLint and apply fixes
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
npm run test:cov    # Run tests with coverage
```

## API documentation

The Swagger document is created during application startup. With the server running, open `http://localhost:3000/api/docs` (replace the port if `PORT` is configured).
