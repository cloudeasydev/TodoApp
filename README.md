# Todo App

A full-stack todo app. The frontend is React with Vite. The backend is Node.js and Express. Todos are stored in MongoDB.

## Features

- Add, edit, complete, and delete tasks
- Filter by All, Open, and Done
- Clear completed tasks
- Separate `.env` files for the client and the server

## Project structure

```
TodoApp/
  client/          React + Vite
    .env           frontend API URL
  server/          Express + Mongoose
    .env           MongoDB URL and server settings
```

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

Install dependencies in both folders:

```bash
cd server
npm install

cd ../client
npm install
```

### Server environment

Copy the example file if `server/.env` is missing:

```bash
cd server
cp .env.example .env
```

`server/.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/todoapp
CLIENT_ORIGIN=http://localhost:5173
```

Replace `MONGODB_URI` with your own database URL. For Atlas, use the connection string from the Atlas dashboard.

### Frontend environment

Copy the example file if `client/.env` is missing:

```bash
cd client
cp .env.example .env
```

`client/.env`:

```
VITE_API_URL=http://localhost:5000
```

Vite only exposes variables that start with `VITE_`. Restart the client after changing this file.

## Run

Start the API:

```bash
cd server
npm run dev
```

The API listens on http://localhost:5000.

In a second terminal, start the frontend:

```bash
cd client
npm run dev
```

Open http://localhost:5173.

Production start for the API (no file watch):

```bash
cd server
npm start
```

Build the frontend:

```bash
cd client
npm run build
npm run preview
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Database connection status |
| GET | `/api/todos` | List todos, newest first |
| POST | `/api/todos` | Create a todo. Body: `{ "title": "..." }` |
| PATCH | `/api/todos/:id` | Update `title` and/or `completed` |
| DELETE | `/api/todos/:id` | Delete a todo |

## Notes

- If port 5000 is already in use, stop the other Node process or change `PORT` in `server/.env` and `VITE_API_URL` in `client/.env` so they match.
- `.env` files are gitignored. Commit `.env.example` only.
