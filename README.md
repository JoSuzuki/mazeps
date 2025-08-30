# Welcome to Mazeps!

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

Copy `.env.sample` to `.env`

### Development

Start the development server with HMR:

```bash
npm run dev
```

Start the database with:

```bash
docker compose up -d
```

Run the migrations:

```bash
npm run migrate:dev
```

Your application will be available at `http://localhost:3000`. You can access
Adminer at `http://localhost:8080`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t mazeps .

# Run the container
docker run -p 3000:3000 mazeps
```

Built with ❤️ using React Router.
