# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── server.js
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

## Database Setup (PostgreSQL with Prisma)

This project uses PostgreSQL as its database, managed with Prisma ORM.

### Prerequisites
- Docker and Docker Compose (or just Docker if you prefer to run PostgreSQL manually)

### Running the Database (Docker Compose)
1.  Ensure Docker is running.
2.  Start the PostgreSQL container:
    ```bash
    docker-compose up -d
    ```
    This will start a PostgreSQL server on `localhost:5432`.
    The database credentials are set in `docker-compose.yml` and mirrored in `.env` for Prisma:
    - User: `prismauser`
    - Password: `prismapassword`
    - Database: `prismadb`

### Running the Database (Manual Docker)
If you encounter issues with `docker-compose` (as was the case during initial setup in some environments) or prefer to run the container directly:
```bash
sudo docker run -d --name db_container_for_prisma --restart always -e POSTGRES_USER=prismauser -e POSTGRES_PASSWORD=prismapassword -e POSTGRES_DB=prismadb -p 5432:5432 -v postgres_data:/var/lib/postgresql/data postgres:15-alpine
```
Note: The `sudo` might be necessary if your user isn't in the `docker` group. The volume `postgres_data` will be created if it doesn't exist.

### Environment Variables
Prisma requires a `DATABASE_URL` environment variable. A `.env` file should have been created by `prisma init` or manually with the following content:
```
DATABASE_URL="postgresql://prismauser:prismapassword@localhost:5432/prismadb?schema=public"
```
**Important:** This `.env` file is (and should be) ignored by Git (see `.gitignore`).

### Database Migrations
Prisma handles database schema migrations.
1.  After making changes to your `prisma/schema.prisma` file, create a new migration:
    ```bash
    npx prisma migrate dev --name your_migration_name
    ```
    Replace `your_migration_name` with a descriptive name for your migration (e.g., `add_post_model`).
2.  This command will:
    - Create a new SQL migration file in `prisma/migrations/`.
    - Apply the migration to the database.
    - Generate/update the Prisma Client.

To run migrations in a production-like environment (without generating new migration files, only applying existing ones):
```bash
npx prisma migrate deploy
```

---

Built with ❤️ using React Router.
