# 🏆 Rinha de Concurseiro — Frontend

> A gamified mock-exam platform to prepare for the **Brazilian Chamber of Deputies** civil-service exam, featuring **real-time question duels**, ranking, performance analytics and social login.

Single-page application built with **React 19**, **TypeScript** and **Vite**, with a real-time duel experience over WebSocket and a clean, feature-oriented architecture.

<p align="left">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Router-React%20Router%207-CA4245?logo=reactrouter&logoColor=white" alt="React Router"/>
  <img src="https://img.shields.io/badge/Real--time-STOMP%20%2F%20WebSocket-010101?logo=socketdotio&logoColor=white" alt="WebSocket"/>
</p>

---

## 💡 About the project

Studying for civil-service exams is repetitive and lonely. **Rinha de Concurseiro** turns that grind into something **competitive and social**: users take mock exams, track their progress by topic, and can even **challenge other candidates to real-time question duels** — a 1v1 quiz battle with a live scoreboard.

This repository holds the **frontend** of the product: the SPA that delivers the full candidate experience — login, mock exams, answer review, analytics, ranking, and the live duel arena.

> 🎯 A personal portfolio project, built end to end to exercise real-world decisions around component architecture, real-time state management and front-end security.

---

## ✨ Key features

| Area | What it delivers |
|---|---|
| 🔐 **Social login** | Google OAuth2 flow with a dedicated callback page; JWT stored client-side and attached to every request. |
| 📝 **Mock exams** | Browse exams, take an attempt with incremental answer saving, then review results and per-question feedback. |
| 📊 **Analytics** | Personal dashboard, per-topic statistics, question notebooks and performance summaries. |
| ⚔️ **Real-time duels** | Invite flow, live 1v1 matches over WebSocket/STOMP, per-question timer, live scoreboard and final result — orchestrated by a custom `useDuelo` hook. |
| 🏅 **Ranking** | Global and per-exam leaderboards. |
| 🔔 **Notifications** | Pending-invite badge driven by a global context. |

---

## 🏗️ Architecture

A **feature-oriented architecture** with a clear separation between UI, state and data access.

```
pages/         → route-level screens (Dashboard, SimuladoPlay, Duelo, Ranking…)
components/    → reusable UI, organized by domain
  ├─ layout/     → Header, Layout, SimuladoLayout
  ├─ common/     → ProtectedRoute and shared building blocks
  ├─ ui/         → presentational components (e.g. QuestaoCard)
  └─ duelo/      → the duel feature, split into fases/, ui/ and hooks/
hooks/         → custom hooks (useDuelo, useConvites, useDueloLobby, useAuth)
contexts/      → global state via Context API (Auth, Notifications)
services/      → typed API layer per domain, built on a shared Axios client
types/         → shared TypeScript contracts
```

### Technical highlights

- **Real-time duel engine on the client:** the `useDuelo` hook owns the full **STOMP-over-SockJS** lifecycle — connecting, subscribing, and acting as an **event dispatcher** that maps each server event (`DUELO_INICIADO`, `OPONENTE_RESPONDEU`, `QUESTAO_RESOLVIDA`…) to a precise state transition. The STOMP client lives in a `useRef` so connection changes never trigger re-renders.
- **Centralized HTTP layer:** a single Axios instance with **request/response interceptors** that inject the JWT, transparently handle `401` (clear token + redirect to login), and support an opt-out `skipRedirect` flag for flows that handle auth errors themselves.
- **Security-conscious rendering:** question statements (rich HTML) are sanitized with **DOMPurify** before being rendered, guarding against XSS.
- **Route protection:** a `ProtectedRoute` wrapper guards every authenticated screen, with a public Home/login and OAuth callback.
- **Typed end to end:** strict TypeScript with project references and a flat ESLint config (`typescript-eslint`, React Hooks & React Refresh plugins).

---

## 🧰 Tech stack

- **Framework:** React 19 + TypeScript 5.8
- **Build tooling:** Vite 7
- **Styling:** Tailwind CSS 4 (Vite plugin + PostCSS)
- **Routing:** React Router 7
- **HTTP:** Axios (interceptor-based JWT + error handling)
- **Real-time:** `@stomp/stompjs` + `sockjs-client`
- **Security:** DOMPurify (HTML sanitization)
- **State:** React Context API + custom hooks
- **Quality:** ESLint 9 (flat config) · TypeScript strict mode

---

## 🚀 Running locally

**Prerequisites:** Node.js 20+ and the [backend](../backend) running.

```bash
# Install dependencies
npm install

# Point the app at your backend (defaults to http://localhost:8080)
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Start the dev server (Vite, with HMR)
npm run dev
```

The app runs at `http://localhost:5173`.

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🗺️ Main routes

| Path | Screen |
|---|---|
| `/` · `/login` | Home / social login |
| `/oauth/callback` | OAuth2 callback handler |
| `/dashboard` | Personal dashboard *(protected)* |
| `/simulados` · `/simulados/:id` | Exam list & play *(protected)* |
| `/simulados/:id/feedback` · `/resultado` | Answer review & results *(protected)* |
| `/cadernos/:caderno` | Question notebooks *(protected)* |
| `/ranking` · `/estatisticas` | Leaderboard & analytics *(protected)* |
| `/duelo` · `/duelo/configurar/:id` · `/duelo/historico` | Duel lobby, setup & history *(protected)* |

---

## 📂 Repository structure

This frontend is part of a full-stack product. The backend (Spring Boot) lives in `../backend`.

---

<p align="center">
  <em>Built as a learning & portfolio project — React • TypeScript • real-time • clean architecture.</em>
</p>
