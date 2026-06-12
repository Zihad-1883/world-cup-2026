# 🏆 FIFA World Cup 2026 Prediction App

A premium, full-stack prediction platform for the 2026 FIFA World Cup. This application allows fans to engage with the tournament through live match tracking, expert analysis (comments), and competitive prediction modes.

![Project Header](https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000)

## ✨ Features

- **🔄 Live Match Sync**: Real-time integration with official football data APIs to track scores, match events, and group standings.
- **🗳️ Dual Prediction Modes**:
  - **Lite Mode**: Predict group standings and best 3rd-placed teams to auto-populate the knockout rounds.
  - **Pro Mode**: Specific match-by-match predictions for the hardcore analyst.
- **💬 Community Intelligence**:
  - **Nested Discussions**: High-performance comment system with support for nested replies and reactions.
  - **Global Trends**: See which nations the community is backing to win it all.
- **📊 Advanced Stats & Ranking**:
  - **World Ranking**: Compete globally and see your ranking based on prediction accuracy.
  - **Accuracy Breakdown**: Detailed stats per round (Group Stage through the Final).
- **🎨 Premium Visual Experience**: A state-of-the-art Nike-inspired "Elite" aesthetic with custom letter avatars, smooth transitions, and glassmorphism UI.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with custom Nike-Elite design tokens
- **Icons**: Lucide React
- **State management**: React Context API

### Backend
- **Environment**: Node.js & Express
- **Database**: PostgreSQL (Neon.tech) with raw SQL migrations
- **Authentication**: JWT-based auth with HttpOnly refresh token rotation
- **API Integration**: Football-Data.org V4 REST API

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or Neon.tech account)
- Football-Data.org API Key

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on the environment variables section below.
4. `npm run dev` (This will automatically run database migrations)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env.local` file.
4. `npm run dev`

## 🔑 Environment Variables

### Backend (`/backend/.env`)
```env
PORT=4000
DATABASE_URL=your_postgresql_url
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
FOOTBALL_DATA_API_KEY=your_api_key
CLIENT_URL=http://localhost:3000
```

### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## 📂 Project Structure

```text
├── backend          # Express.js Server
│   ├── src/config   # Database & Auth config
│   ├── src/migrations # SQL Migration files
│   ├── src/controllers # API Logic
│   └── src/services  # Live sync & stats logic
├── frontend         # Next.js Application
│   ├── src/app      # Pages & Routing
│   ├── src/components # UI Design System
│   └── src/context  # Global State (Auth)
└── PROJECT.md       # Full Technical Specification
```

## 📝 License
This project is for educational and fan engagement purposes for the World Cup 2026.

---
Built with 💚 by the [Zihad-1883](https://github.com/Zihad-1883) team.
