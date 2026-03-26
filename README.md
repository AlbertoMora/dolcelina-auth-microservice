# Authentication Microservice

## Overview

This is an **Authentication and Authorization Microservice** developed as part of a university
business internship. It serves auth-related data and security flows for an e-commerce web platform,
including login/signup, session validation and refresh, OAuth integration, permission checks, and
user lookup for identity-aware features.

## Purpose

Built for a distributed microservices architecture, this service handles:

- **User Authentication**: Login, signup, signout, and access token validation
- **Session Management**: Session token checks and session refresh workflows
- **Authorization Checks**: Fine-grained permission validation for protected operations
- **OAuth Integration**: Google OAuth client key delivery and callback validation
- **Identity Support**: User lookup endpoints for integration with other platform services

## Technology Stack

### Core Framework & Runtime

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for REST API endpoints
- **TypeScript** - Strongly-typed JavaScript for improved code reliability and maintainability
- **Socket.io** - Real-time bidirectional communication support

### Database Layer

- **MariaDB** - Relational database for structured authentication and user data
- **Sequelize ORM** - Object-Relational Mapping for MariaDB/MySQL interactions
- **MongoDB (Mongoose)** - NoSQL database for flexible schema data (logs, sessions, MFA, settings)
- **Redis** - In-memory cache and fast key-value operations for auth/session scenarios

### Authentication & Authorization

- **JWT (jsonwebtoken)** - Stateless authentication token generation and verification
- **OpenFGA SDK** - Fine-grained authorization and access control modeling
- **Argon2** - Secure password hashing algorithm
- **Node-vault** - Secrets management and secure configuration integration
- **Express Validator** - Input validation and sanitization for auth requests
- **Node-RSA** - RSA cryptographic support for security-related operations

### Integrations & Messaging

- **Axios** - HTTP client for external service communication
- **MailerSend** - Email delivery service integration
- **Handlebars** - Template engine for dynamic email or HTML content

### Utilities & Observability

- **Log4js** - Logging framework
- **Morgan** - HTTP request logger middleware
- **CORS** - Cross-Origin Resource Sharing middleware
- **Dotenv** - Environment variable management via .env files
- **Cross-env** - Cross-platform environment variable setup in scripts
- **GeoIP-lite** - IP geolocation helpers
- **Sniffr** - Device/browser detection from user-agent strings
- **Moment.js** - Date and time manipulation
- **UUID** - Unique identifier generation
- **XMLDOM** - XML parsing and serialization
- **@aure/commons** - Shared internal utilities and middleware helpers

### Development & Testing

- **Nodemon** - Automatic server restart on file changes
- **Jest** - Unit and integration testing framework
- **Supertest** - HTTP endpoint testing for Express APIs
- **Sequelize CLI** - Database tooling and Sequelize workflow support
- **Sequelize Auto** - Model generation from existing database schemas
- **ts-node** - TypeScript execution and REPL support
- **ts-loader** - TypeScript loader for build pipelines
- **TypeScript Compiler (tsc)** - Type checking and transpilation
- **@types packages** - Type definitions for TypeScript tooling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MariaDB instance
- MongoDB instance
- Redis instance

### Installation

```bash
npm install
```

### Development

Start the development server with auto-reload:

```bash
npm start
```

### Production

Run in production mode:

```bash
npm run prod
```

### TypeScript Watch Mode

Compile TypeScript and copy resources on file changes:

```bash
npm run tsw
```

## Project Structure

```text
src/
├── config/         - Application configuration, database, middleware, and route setup
├── constants/      - Application constants and shared definitions
├── controllers/    - Request handlers for authentication and authorization logic
├── i18n/           - Internationalization resources
├── middlewares/    - Custom middleware (authorization and request flow controls)
├── models/         - Database models (MariaDB and MongoDB)
├── resources/      - Static resources (HTML and JSON)
├── routes/         - API route definitions
├── services/       - Service-layer business logic
├── types/          - TypeScript type definitions
├── utils/          - Helper functions and utilities
├── viewmodels/     - Request/response data transfer objects
└── web_sockets/    - WebSocket and realtime communication modules
```

## API Endpoints

- `POST /v1/authentication/login` - User login
- `POST /v1/authentication/signup` - User registration
- `POST /v1/authentication/check-session-token` - Validate access/session token
- `POST /v1/authentication/refresh-session` - Refresh active session token
- `DELETE /v1/authentication/signout` - Sign out user session
- `POST /v1/authorization/check-permission` - Validate user permissions
- `GET /v1/oauth/google/key` - Get Google OAuth client key
- `POST /v1/oauth/google/callback` - Validate Google OAuth callback/session info
- `GET /v1/users/` - Query users by name or related user lookup criteria

## License

UNLICENSED - Private project for internship purposes
