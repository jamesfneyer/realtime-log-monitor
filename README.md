# Realtime Log Monitor

A distributed system for real-time log monitoring, alerting, and visualization. Built with Next.js, Node.js, TypeScript, Tailwind CSS, and pnpm workspaces.

---

## Prerequisites
- **Node.js** v18 or newer
- **pnpm** (recommended for workspace support)
- (Optional) **Docker** (for database/local dev)

---

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/jamesfneyer/realtime-log-monitor.git
cd realtime-log-monitor
```

### 2. Install dependencies (from the root)
```sh
pnpm install
```

### 3. Start all apps (in separate terminals or with a process manager)

#### Dashboard (Next.js frontend)
```sh
cd apps/dashboard
pnpm dev
```

#### Log Consumer (Node.js backend)
```sh
cd apps/log-consumer
pnpm dev
```

#### Log Producer (Node.js backend)
```sh
cd apps/log-producer
pnpm dev
```

#### Websocket Server (for real-time updates)
```sh
cd apps/websocket-server
pnpm dev
```

---

## Project Structure
```
realtime-log-monitor/
  apps/
    dashboard/         # Next.js 14+ App Router frontend (React, Tailwind)
    log-consumer/      # Node.js backend for log ingestion and alerting
    log-producer/      # Node.js backend for log generation/testing
    websocket-server/  # Real-time WebSocket server
  packages/
    database/          # Shared database schema and migration logic
    types/             # Shared TypeScript types
  README.md            # (this file)
  package.json         # pnpm workspace config
  pnpm-workspace.yaml  # Workspace definition
```

---

## Tools & Tech
- [Next.js 14+](https://nextjs.org/) (App Router)
- [React 18+](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [pnpm](https://pnpm.io/) (monorepo/workspace support)
- [Drizzle ORM](https://orm.drizzle.team/) (database)

---

## Notes
- All apps use a shared workspace for types and database schema.
- The dashboard uses a reusable `Card` component for consistent UI/UX.
- For best results, use VS Code with the Tailwind CSS IntelliSense extension.
- See each app's README for more details and environment variable setup.

---

For questions or contributions, open an issue or PR!