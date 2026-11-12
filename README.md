# Restaurant POS

A full-stack point-of-sale application for restaurant operations. It brings menu and category management, table-based order handling, checkout, and sales history together in a web interface, with live updates supported by WebSockets.

> **Portfolio project** — built to explore a practical full-stack workflow, from a React interface and Spring Boot API to PostgreSQL persistence and Docker-based deployment.

## At a glance

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Java 21, Spring Boot, Spring Data JPA, Spring Web MVC
- **Database:** PostgreSQL
- **Live communication:** WebSockets
- **Run and deploy:** Docker Compose

## Features

- Browse menu items organized by category
- Manage orders associated with restaurant tables
- Review sales history
- Receive real-time updates through WebSockets
- Enforce one open order per table with a PostgreSQL partial unique index
- Run the frontend, backend, and database together using Docker Compose

## Architecture

```text
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│ React + TypeScript │  API  │ Spring Boot        │       │ PostgreSQL         │
│ Frontend           │──────▶│ REST + WebSockets  │──────▶│ Persistent storage  │
└────────────────────┘       └────────────────────┘       └────────────────────┘
          └──────────────── Docker Compose ─────────────────┘
```

The repository is organized into three main parts:

```text
backend/       Spring Boot application and tests
frontend/      React application
 database/     SQL migration scripts
docker-compose.yml
```

Backend code is grouped by domain, including categories, menu, orders, tables, sales, and WebSockets. The frontend separates pages, reusable components, API services, and shared types.

## Run locally with Docker Compose

### Requirements

- Docker with the Compose plugin

### 1. Configure environment variables

Create a `.env` file in the repository root:

```dotenv
POSTGRES_DB=restaurant_pos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me
FRONTEND_PORT=3000
```

Choose a suitable password for your environment. Keep real credentials out of version control.

### 2. Start the application

From the repository root, run:

```bash
docker compose up --build
```

Open the frontend at [http://localhost:3000](http://localhost:3000), or at the port configured with `FRONTEND_PORT`. Stop the services with `Ctrl+C`; to stop and remove the containers, run `docker compose down`.

PostgreSQL data is stored in the Compose-managed `postgres_data` volume and persists when containers are recreated. To remove the database volume as well, use `docker compose down -v` (this deletes the stored data).

## Development commands

### Frontend

Requires Node.js and npm.

```bash
cd frontend
npm install
npm run dev
```

Available scripts:

```bash
npm run build    # Type-check and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

### Backend

Requires Java 21. The Maven wrapper is included, so a separate Maven installation is not needed.

```bash
cd backend
./mvnw spring-boot:run
```

Run backend tests with:

```bash
./mvnw test
```

For running the backend outside Docker, configure the PostgreSQL connection variables expected by `backend/src/main/resources/application.properties` (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`).

## Database integrity

The SQL migration at `database/migrations/V1__prevent_multiple_open_orders.sql` creates a partial unique index that allows at most one order with `OPEN` status for each table. The migration checks for duplicate open orders first and stops with an error if any are present.

## Project structure

```text
.
├── backend/
│   ├── src/main/java/com/restaurant_pos/backend/
│   │   ├── category/
│   │   ├── menu/
│   │   ├── order/
│   │   ├── orderitem/
│   │   ├── sales/
│   │   ├── table/
│   │   └── websocket/
│   └── src/test/
├── database/migrations/
├── frontend/src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── types/
└── docker-compose.yml
```

## What this project demonstrates

- Building a typed, component-based user interface with React and TypeScript
- Structuring a Java backend around business domains and persistence layers
- Connecting a frontend, API, and relational database
- Supporting real-time application updates with WebSockets
- Applying database-level constraints to protect business rules
- Packaging a multi-service application for local use with Docker Compose

## License

No license file is currently included in this repository.
