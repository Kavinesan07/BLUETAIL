# Bluetail Frontend

React + Vite client for the Bluetail FastAPI backend.

## Run
```
npm install
npm run dev
```
Open http://localhost:5173 (backend must be running on the URL in `.env`).

## Structure
```
src/
├── main.jsx              entry: Router + AuthProvider
├── App.jsx               route table
├── services/             API calls (api.js, authService.js)
├── context/              AuthContext (login, register, logout, user state)
├── components/           RouteGuards, AuthLayout, FormField
├── pages/                Login, Register, Dashboard
└── styles/global.css
```
