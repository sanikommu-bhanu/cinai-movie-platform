# 🎬 CINAI — AI Movie Discovery Platform

> A production-grade, cinematic AI movie discovery platform powered by TMDB, FastAPI, React, and a hybrid recommendation engine.

---

## ✨ Features

- **Real movie data** — all content sourced live from TMDB API
- **Strict poster filtering** — movies without posters are never shown
- **Legal YouTube trailers** — embedded via TMDB's official video API
- **Hybrid AI recommendations** — Content (40%) × Collaborative (30%) × Sentiment (20%) × Popularity (10%)
- **Explainable AI** — confidence scores + human-readable reasons per recommendation
- **AI Chatbot** — intent-based movie assistant with genre, mood, trending, and search support
- **Cinematic UI** — Framer Motion animations, glassmorphism, film grain, responsive design
- **9 pages** — Home, Discover, Recommendations, Trending, Genres, Watchlist, Analytics, AI Chat, About

---

## 📁 Project Structure

```
cinai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── store/
│       │   └── index.js          # Zustand state + API fetch cache
│       ├── components/
│       │   ├── UI.jsx             # Shared components
│       │   ├── Navbar.jsx         # Navigation + search + voice
│       │   ├── MovieDetail.jsx    # Movie modal with trailer
│       │   └── Footer.jsx
│       └── pages/
│           ├── HomePage.jsx
│           ├── DiscoverPage.jsx
│           ├── RecommendationsPage.jsx
│           ├── TrendingPage.jsx
│           ├── GenresPage.jsx
│           ├── WatchlistPage.jsx
│           ├── AnalyticsPage.jsx
│           ├── ChatPage.jsx
│           └── AboutPage.jsx
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- A free TMDB API key → https://www.themoviedb.org/settings/api

---

### 1. Get a TMDB API Key

1. Go to https://www.themoviedb.org/signup and create a free account
2. Navigate to **Settings → API → Create → Developer**
3. Copy your **API Key (v3 auth)**

---

### 2. Backend Setup

```bash
cd cinai/backend

# Copy env file and add your key
cp .env.example .env
# Edit .env and set: TMDB_API_KEY=your_key_here

# Install dependencies
pip install -r requirements.txt

# Start the backend
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd cinai/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

### 4. Open the App

Navigate to **http://localhost:5173** in your browser.

> ⚠️ Both backend AND frontend must be running simultaneously.

---

## 🔧 VS Code Setup (Recommended)

1. Open the `cinai/` folder in VS Code
2. Install recommended extensions: **Python**, **ESLint**, **Tailwind CSS IntelliSense**
3. Open two integrated terminals (`` Ctrl+` `` then split):
   - Terminal 1: `cd backend && uvicorn main:app --reload`
   - Terminal 2: `cd frontend && npm run dev`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| GET | `/api/trending` | Trending movies (day/week) |
| GET | `/api/movies/popular` | Popular movies |
| GET | `/api/movies/top_rated` | Top rated movies |
| GET | `/api/movies/now_playing` | Now in cinemas |
| GET | `/api/movies/upcoming` | Upcoming releases |
| GET | `/api/movies/{id}` | Full movie detail + trailer |
| GET | `/api/genres` | All TMDB genres |
| GET | `/api/discover` | Filtered movie discovery |
| GET | `/api/search?q=` | Movie search |
| GET | `/api/recommendations/{id}` | Hybrid AI recommendations |
| GET | `/api/hidden_gems` | High-rated low-popularity films |
| GET | `/api/ai_picks` | Curated AI selections |
| GET | `/api/analytics` | Aggregated statistics |
| GET | `/api/chatbot` | AI chatbot responses |

---

## 🤖 Recommendation Engine

The hybrid model scores each candidate movie:

```
final_score = (0.40 × content_similarity)
            + (0.30 × collaborative_score)
            + (0.20 × sentiment_alignment)
            + (0.10 × popularity_score)
```

- **Content similarity** — Jaccard index on genre ID sets
- **Collaborative score** — Position rank in TMDB similar/recommendations lists
- **Sentiment alignment** — VADER-lite NLP on movie overview text
- **Popularity score** — Normalised TMDB popularity relative to base movie

Each recommendation includes a **confidence score (0–99%)** and up to 3 **human-readable reasons**.

---

## 🏗️ Build for Production

```bash
# Frontend
cd frontend
npm run build      # outputs to frontend/dist/

# Backend (production)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## ⚖️ Legal

This product uses the TMDB API but is not endorsed or certified by TMDB.  
Movie data, posters, and metadata are provided by [The Movie Database (TMDB)](https://www.themoviedb.org).  
Trailers are embedded from YouTube via TMDB's official video data API.
