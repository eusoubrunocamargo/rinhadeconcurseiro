# 🏆 Rinha de Concurseiro

> LIVE DEMO: https://rinha-de-concurseiro.up.railway.app/

> A gamified mock-exam platform to prepare for the **Brazilian Chamber of Deputies** civil-service exam, featuring **real-time question duels**, ranking, performance analytics and social login.

A full-stack product built end to end — a **Spring Boot** REST + WebSocket API and a **React 19** single-page application — designed to make studying for civil-service exams competitive and social.

<p align="left">
  <img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white" alt="Java 17"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.7-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Flyway-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Real--time-STOMP%20%2F%20WebSocket-010101?logo=socketdotio&logoColor=white" alt="WebSocket"/>
  <img src="https://img.shields.io/badge/Tests-112%20passing-success?logo=junit5&logoColor=white" alt="Tests"/>
</p>

---

## 💡 About the project

Studying for civil-service exams is repetitive and lonely. **Rinha de Concurseiro** turns that grind into something **competitive and social**: users take mock exams, track their progress by topic, and can even **challenge other candidates to real-time question duels** — a 1v1 quiz battle with a live scoreboard.

The project is a complete, production-shaped system: secure authentication, versioned database, a real-time game engine over WebSocket, automated tests and CI.

> 🎯 A personal portfolio project, built end to end to exercise real-world decisions around architecture, security and real-time systems — across both backend and frontend.

---

## ✨ Key features

| Area | What it delivers |
|---|---|
| 🔐 **Authentication** | Google **OAuth2 (OIDC)** social login + **stateless JWT**, with route/role-based authorization. |
| 📝 **Mock exams** | Exam catalog, exam of the day, attempt flow with incremental answer saving, and automatic grading. |
| 📊 **Performance** | Personal dashboard, per-topic statistics, question notebooks and summaries. |
| ⚔️ **Real-time duels** | Token-based invitations and 1v1 question matches over **WebSocket/STOMP**, with live events, per-question timer and final result. |
| 🏅 **Ranking** | Global and per-exam leaderboards, highlighting the current user. |
| 🛠️ **Admin / Import** | Bulk question import protected by `ADMIN` role. |

---

## 🏗️ Architecture

A clean separation between a **layered backend API** and a **feature-oriented React frontend**, connected over REST and a real-time WebSocket channel.

```
┌──────────────────────────┐         REST (JWT)          ┌──────────────────────────┐
│        Frontend          │ ──────────────────────────▶ │         Backend          │
│   React 19 + TypeScript  │                             │   Spring Boot 3.5 (Java) │
│        Vite · Tailwind   │ ◀───── WebSocket / STOMP ──▶ │   Real-time duel engine  │
└──────────────────────────┘        (live duels)          └────────────┬─────────────┘
                                                                        │
                                                              PostgreSQL + Flyway
```

### Backend — `backend/`

REST + WebSocket API in **Java 17 / Spring Boot 3.5**, organized in layers (`controller → service → repository → entity`) with dedicated DTOs — JPA entities are never exposed at the API boundary.

- **Stateless security:** `STATELESS` sessions, custom JWT filter before `UsernamePasswordAuthenticationFilter`, environment-configurable CORS, per-route/role authorization.
- **Real-time duel engine:** in-memory STOMP broker over SockJS, a **custom `ChannelInterceptor`** authenticating WebSocket messages via JWT, and a **dedicated `ThreadPoolTaskScheduler`** driving each question's timer.
- **Versioned database:** Flyway migrations (`V1` → `V12`) with `ddl-auto: validate` — never `create`/`update` in production.
- **Quality:** **112 automated tests** across 14 classes (JUnit 5 + H2), with **GitHub Actions** running `mvn clean test` on every push to `main`.

📄 See [`backend/README.md`](backend/README.md) for full details.

### Frontend — `frontend/`

Single-page application in **React 19 + TypeScript + Vite**, with a feature-oriented structure (`pages/`, domain-grouped `components/`, `hooks/`, `contexts/`, typed `services/`).

- **Real-time duels on the client:** the `useDuelo` hook owns the full **STOMP-over-SockJS** lifecycle and dispatches each server event (`DUELO_INICIADO`, `QUESTAO_RESOLVIDA`…) to a precise state transition.
- **Centralized HTTP layer:** a single Axios instance with interceptors that inject the JWT and transparently handle `401`.
- **Security-conscious rendering:** rich-HTML question statements sanitized with **DOMPurify** (XSS guard).
- **Route protection:** a `ProtectedRoute` wrapper guards every authenticated screen.

📄 See [`frontend/README.md`](frontend/README.md) for full details.

---

## 🧰 Tech stack

**Backend**
- Java 17 · Spring Boot 3.5.7 (Web, Data JPA, Security, Validation, WebSocket)
- Spring Security · OAuth2 Client (Google/OIDC) · JWT (`jjwt`) · BCrypt
- PostgreSQL · Hibernate/JPA · Flyway · Maven
- JUnit 5 · Spring Security Test · H2 · GitHub Actions

**Frontend**
- React 19 · TypeScript 5.8 · Vite 7
- Tailwind CSS 4 · React Router 7
- Axios (interceptor-based JWT) · `@stomp/stompjs` + `sockjs-client`
- DOMPurify · Context API + custom hooks · ESLint 9

---

## 🚀 Getting started

**Prerequisites:** Java 17, Node.js 20+, PostgreSQL, and Google OAuth2 credentials.

### Backend

```bash
cd backend

# Configure environment variables
export DB_PASSWORD=postgres
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret

# Run (Flyway applies migrations automatically)
./mvnw spring-boot:run        # → http://localhost:8080
```

### Frontend

```bash
cd frontend

npm install
echo "VITE_API_URL=http://localhost:8080" > .env.local
npm run dev                   # → http://localhost:5173
```

---

## 📂 Repository structure

```
rinhadeconcurseiro/
├─ backend/    → Spring Boot REST + WebSocket API   (see backend/README.md)
├─ frontend/   → React + TypeScript SPA             (see frontend/README.md)
└─ scripts/    → utility scripts
```

---

<p align="center">
  <em>Built as a learning & portfolio project — Java • Spring Boot • React • TypeScript • real-time • testing.</em>
</p>
