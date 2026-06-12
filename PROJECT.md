# ⚽ FIFA World Cup 2026 Prediction App — Master Project Document
> This file is the single source of truth for both the frontend and backend agents. Do NOT deviate from the contracts defined here. If something needs to change, update this file first.
---
## 📁 Monorepo Structure
```
/worldcup-2026
 /frontend → Next.js 14+ (App Router), TypeScript, Tailwind CSS
 /backend → Express, TypeScript, PostgreSQL (Neon), Better Auth, JWT
 PROJECT.md → This file

```
---
## 🌐 Ports & URLs

| Service | URL |
| ------------- | ------------- |
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000 |
| Neon DB | Set via DATABASE_URL in .env |
| Live API | https://api.football-data.org/v4 |

---
## 🔐 Environment Variables
### Backend `/backend/.env`
```
DATABASE_URL=[https://postgresql://neondb_owner:npg_RP25maUvJzDd@ep-restless-butterfly-aodpdeoc-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require](https://postgresql://neondb_owner:npg_RP25maUvJzDd@ep-restless-butterfly-aodpdeoc-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require)
JWT_SECRET=034a77dfc00ce5553b3f1f1dccbc06b55d659bb1de1e19fc4f6e9aaaf729f450
BETTER_AUTH_SECRET=BeAwDAj4A1nOC5kfozKhN2YZDgY87Pcw
BETTER_AUTH_URL=http://localhost:4000
CLIENT_URL=http://localhost:3000
PORT=4000
FOOTBALL_DATA_API_KEY=[https://api.football-data.org/v4](https://api.football-data.org/v4)

```
### Frontend `/frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000

```
---
## 🗄️ Database Schema
### `users`
```sql
CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 email VARCHAR(255) UNIQUE NOT NULL,
 username VARCHAR(50) UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 avatar_url TEXT, -- null = use first letter of username
 role VARCHAR(10) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
 created_at TIMESTAMP DEFAULT NOW(),
 updated_at TIMESTAMP DEFAULT NOW()
);

```
### `teams`
```sql
CREATE TABLE teams (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name VARCHAR(100) NOT NULL,
 code VARCHAR(3) NOT NULL, -- e.g. BRA, ARG, FRA
 group_name VARCHAR(2), -- e.g. A, B, C ... L
 group_position INTEGER, -- 1, 2, 3, or 4
 flag_url TEXT, -- e.g. https://flagcdn.com/w40/br.png
 confederation VARCHAR(20),
 created_at TIMESTAMP DEFAULT NOW()
);

```
### `players`
```sql
CREATE TABLE players (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
 name VARCHAR(100) NOT NULL,
 shirt_name VARCHAR(50), -- name on shirt e.g. MESSI, RONALDO
 position VARCHAR(3) CHECK (position IN ('GK', 'DF', 'MF', 'FW')),
 jersey_number INTEGER,
 date_of_birth DATE,
 club VARCHAR(100),
 height_cm INTEGER,
 photo_url TEXT,
 created_at TIMESTAMP DEFAULT NOW()
);

```
### `matches`
```sql
CREATE TABLE matches (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 team1_id UUID REFERENCES teams(id),
 team2_id UUID REFERENCES teams(id),
 round VARCHAR(20) NOT NULL CHECK (round IN ('GROUP', 'R32', 'R16', 'QF', 'SF', 'FINAL')),
 group_name VARCHAR(2), -- only for GROUP round
 kickoff_time TIMESTAMP NOT NULL, -- stored as UTC
 venue VARCHAR(150),
 city VARCHAR(100),
 team1_score INTEGER, -- null until played
 team2_score INTEGER, -- null until played
 actual_winner_id UUID REFERENCES teams(id), -- null until played; null = draw in group
 is_locked BOOLEAN DEFAULT FALSE,
 match_number INTEGER, -- sequential match number
 external_id VARCHAR(50), -- football-data.org match ID for live sync
 created_at TIMESTAMP DEFAULT NOW()
);

```
### `predictions`
```sql
CREATE TABLE predictions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
 predicted_winner_id UUID REFERENCES teams(id),
 is_correct BOOLEAN, -- null until match played
 points_earned INTEGER DEFAULT 0,
 created_at TIMESTAMP DEFAULT NOW(),
 updated_at TIMESTAMP DEFAULT NOW(),
 UNIQUE(user_id, match_id)
);

```
### `comments`
```sql
CREATE TABLE comments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 match_id UUID REFERENCES matches(id) ON DELETE SET NULL, -- optional
 content TEXT NOT NULL CHECK (char_length(content) <= 500),
 created_at TIMESTAMP DEFAULT NOW(),
 updated_at TIMESTAMP DEFAULT NOW()
);

```
### `comment_reactions`
```sql
CREATE TABLE comment_reactions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 type VARCHAR(10) CHECK (type IN ('LIKE', 'LOVE')),
 created_at TIMESTAMP DEFAULT NOW(),
 UNIQUE(comment_id, user_id) -- one reaction per user per comment
);

```
---
## 👤 Avatar Logic
- When a user registers without uploading a photo, `avatar_url` is NULL in the DB.
- The frontend must detect `avatar_url === null` and render the **first letter of username** as a styled avatar (colored circle with letter).
- The user can update their avatar later via `PATCH /api/users/me/avatar`.
- On the backend, when returning `UserPublic`, include `avatarUrl: string | null`. Frontend handles the fallback display logic.
---
## 🔐 Auth Rules

| Route Type | Guest | Signed-Up User | Admin |
| ------------- | ------------- | ------------- | ------------- |
| View matches (basic list) | ✅ | ✅ | ✅ |
| View group stage results | ✅ | ✅ | ✅ |
| View full match details | ❌ | ✅ | ✅ |
| View team details | ❌ | ✅ | ✅ |
| View player details | ❌ | ✅ | ✅ |
| Submit predictions | ✅ | ✅ | ✅ |
| Store/save predictions ← only signed-up saved ( For Guest, UI Only, don't store into database)  | ❌ | ✅ | ✅ |
| View own predictions |✅ | ✅ | ✅ |
| Post/view comments | ❌ | ✅ | ✅ |
| React to comments (like/love) | ❌ | ✅ | ✅ |
| View public stats / popular picks | ✅ | ✅ | ✅ |
| Update match results | ❌ | ❌ | ✅ |
| Lock/unlock matches | ❌ | ❌ | ✅ |
| Trigger live sync | ❌ | ❌ | ✅ |

### JWT
- Access token sent in `Authorization: Bearer <token>`
- Access token payload: `{ userId, email, username, role }`
- Access token expiry: `15m`
- Refresh token: httpOnly cookie, expiry `7d`
- On access token expiry → client calls `POST /api/auth/refresh` with cookie
- Backend issues new access token
- On logout → refresh token cookie is cleared server-side
---
## 📡 API Contract
> Base URL: `http://localhost:4000/api` All responses use this envelope:
>
> -   Success: `{ success: true, data: <payload> }`
> -   Error: `{ success: false, error: "<message>" }`
---
### 🔑 Auth Endpoints
### `POST /api/auth/register`
```
Body: { email, password, username }
Response: { user: UserPublic, token: string }
Errors: 409 if email or username taken

```
### `POST /api/auth/login`
```
Body: { email, password }
Response: { user: UserPublic, token: string }
Errors: 401 if invalid credentials

```
### `GET /api/auth/me`
```
Auth: Required
Response: { user: UserPublic }

```
### `POST /api/auth/logout`
```
Auth: Required
Response: { success: true }

```

**#### `POST /api/auth/refresh`
**
**Auth:     Refresh token in httpOnly cookie
**
**Response: { token: string }   ← new access token
**
**Errors:   401 if cookie missing or expired
**

```

**
**
**#### `POST /api/auth/logout`
**
**Auth:     Required
**
**Response: { success: true }
**
**Note:     Clears the refresh token httpOnly cookie server-side**
---
### 👤 User Endpoints
### `PATCH /api/users/me/avatar`
```
Auth: Required
Body: { avatarUrl: string } -- URL to uploaded image
Response: { user: UserPublic }

```
### `GET /api/users/me`
```
Auth: Required
Response: { user: UserPublic }

```

#### `PATCH /api/users/me`
Auth:     Required
Body:     { username?: string, email?: string }
Response: { user: UserPublic }
Errors:   409 if username or email already taken by another user

#### `PATCH /api/users/me/avatar`
Auth:     Required
Body:     { avatarUrl: string }
Response: { user: UserPublic }
---
### ⚽ Teams Endpoints
### `GET /api/teams`
```
Auth: Public
Response: { teams: TeamBasic[] }
Note: id, name, code, groupName, groupPosition, flagUrl, confederation

```
### `GET /api/teams/:id`
```
Auth: Required
Response: { team: TeamFull, players: Player[] }

```
### `GET /api/teams/group/:groupName`
```
Auth: Public
Response: { group: string, teams: TeamBasic[] }

```
---
### 👤 Players Endpoints
### `GET /api/players/team/:teamId`
```
Auth: Required
Response: { players: Player[] }

```
### `GET /api/players/:id`
```
Auth: Required
Response: { player: Player }

```
---
### 🗓️ Matches Endpoints
### `GET /api/matches`
```
Auth: Public
Query: ?round=GROUP|R32|R16|QF|SF|FINAL (optional)
 ?group=A|B|...|L (optional, for group stage)
Response: { matches: MatchBasic[] }

```
### `GET /api/matches/:id`
```
Auth: Required
Response: { match: MatchFull }

```
### `GET /api/matches/round/:round`
```
Auth: Public
Response: { round: string, matches: MatchBasic[] }

```
### `PATCH /api/matches/:id/result` ← Admin only
```
Auth: Required + Admin
Body: { team1Score: number, team2Score: number, actualWinnerId: string | null }
Response: { match: MatchFull }
Note: Sets is_locked=true. Triggers predictionScoring service.
 actualWinnerId can be null for group stage draws.

```
### `PATCH /api/matches/:id/lock` ← Admin only
```
Auth: Required + Admin
Body: { isLocked: boolean }
Response: { match: MatchBasic }

```
### `POST /api/matches/sync-live` ← Admin only
```
Auth: Required + Admin
Body: {}
Response: { updated: number, message: string }
Note: Calls football-data.org API, updates scores + locks finished matches,
 triggers prediction scoring for newly finished matches.
 API: GET https://api.football-data.org/v4/matches?competitions=WC&season=2026
 Header: X-Auth-Token: FOOTBALL_DATA_API_KEY

```
---
### 🔮 Predictions Endpoints
### `POST /api/predictions`
```
Auth: Required
Body: { predictions: Array<{ matchId: string, predictedWinnerId: string }> }
Response: { saved: number, skipped: number, predictions: Prediction[] }
Note: Batch upsert. Silently skip any match where is_locked=true.
 Validate: predictedWinnerId must be team1_id or team2_id of that match.
 Validate: kickoff_time > NOW() for each match.
 UPSERT on conflict (user_id, match_id).

```
### `GET /api/predictions/me`
```
Auth: Required
Response: { predictions: PredictionWithMatch[] }

```
### `GET /api/predictions/me/accuracy`
```
Auth: Required
Response: {
 total: number,
 correct: number,
 incorrect: number,
 pending: number,
 accuracyPercent: number,
 pointsTotal: number,
 byRound: Record<Round, { total: number; correct: number }>
}

```
### `GET /api/predictions/stats`
```
Auth: Public
Response: {
 topPickedWinner: TeamBasic,
 popularPicks: Array<{ team: TeamBasic, pickCount: number, percentOfUsers: number }>,
 totalPredictors: number
}

```
---
### 💬 Comments Endpoints
### `GET /api/comments`
```
Auth: Required
Query: ?matchId=<uuid> (optional)
Response: { comments: CommentWithReactions[] }

```
### `POST /api/comments`
```
Auth: Required
Body: { content: string, matchId?: string }
Response: { comment: CommentWithReactions }
Errors: 400 if content empty or > 500 chars

```
### `DELETE /api/comments/:id`
```
Auth: Required (own comment only; Admin can delete any)
Response: { success: true }

```
### `POST /api/comments/:id/react`
```
Auth: Required
Body: { type: "LIKE" | "LOVE" }
Response: { reaction: CommentReaction | null, counts: { LIKE: number, LOVE: number } }
Note: Toggle: same type again = remove. Different type = switch.

```
---
## 🧩 Shared TypeScript Types
> Copy exactly into `/src/types/index.ts` in BOTH frontend and backend.
```typescript
export type UserRole = 'USER' | 'ADMIN';

export interface UserPublic {
 id: string;
 email: string;
 username: string;
 avatarUrl: string | null; // null = show first letter of username as avatar
 role: UserRole;
 createdAt: string;
}

export interface TeamBasic {
 id: string;
 name: string;
 code: string;
 groupName: string | null;
 groupPosition: number | null;
 flagUrl: string | null;
 confederation: string | null;
}

export interface TeamFull extends TeamBasic {
 players: Player[];
}

export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
 id: string;
 teamId: string;
 name: string;
 shirtName: string | null;
 position: Position;
 jerseyNumber: number | null;
 dateOfBirth: string | null;
 club: string | null;
 heightCm: number | null;
 photoUrl: string | null;
}

export type Round = 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL';

export interface MatchBasic {
 id: string;
 team1Id: string;
 team2Id: string;
 team1Name: string;
 team2Name: string;
 team1Code: string;
 team2Code: string;
 team1FlagUrl: string | null;
 team2FlagUrl: string | null;
 round: Round;
 groupName: string | null;
 kickoffTime: string;
 venue: string | null;
 city: string | null;
 isLocked: boolean;
 team1Score: number | null;
 team2Score: number | null;
 actualWinnerId: string | null;
 matchNumber: number | null;
 externalId: string | null;
}

export interface MatchFull extends MatchBasic {
 team1: TeamBasic;
 team2: TeamBasic;
 actualWinner: TeamBasic | null;
}

export interface Prediction {
 id: string;
 userId: string;
 matchId: string;
 predictedWinnerId: string;
 isCorrect: boolean | null;
 pointsEarned: number;
 createdAt: string;
 updatedAt: string;
}

export interface PredictionWithMatch extends Prediction {
 match: MatchBasic;
 predictedWinner: TeamBasic;
}

export interface AccuracyStats {
 total: number;
 correct: number;
 incorrect: number;
 pending: number;
 accuracyPercent: number;
 pointsTotal: number;
 byRound: Record<Round, { total: number; correct: number }>;
}

export type ReactionType = 'LIKE' | 'LOVE';

export interface Comment {
 id: string;
 userId: string;
 matchId: string | null;
 content: string;
 createdAt: string;
 updatedAt: string;
}

export interface CommentReaction {
 id: string;
 commentId: string;
 userId: string;
 type: ReactionType;
 createdAt: string;
}

export interface CommentWithReactions extends Comment {
 author: UserPublic;
 reactionCounts: { LIKE: number; LOVE: number };
 userReaction: ReactionType | null;
}

**export interface AuthTokens {
**
**  token: string;          // short-lived access token (15m)
**
**  // refresh token is in httpOnly cookie, not in response body
**
**}**

export interface ApiSuccess<T> { success: true; data: T; }
export interface ApiError { success: false; error: string; }
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

```
---
## 🏆 Tournament Groups & Teams
### Full Group Stage Data (seed this exactly)

| Group | Pos | Team | Code |
| ------------- | ------------- | ------------- | ------------- |
| A | 1 | Mexico | MEX |
| A | 2 | South Africa | RSA |
| A | 3 | Korea Republic | KOR |
| A | 4 | Czechia | CZE |
| B | 1 | Canada | CAN |
| B | 2 | Bosnia & Herzegovina | BIH |
| B | 3 | Qatar | QAT |
| B | 4 | Switzerland | SUI |
| C | 1 | Brazil | BRA |
| C | 2 | Morocco | MAR |
| C | 3 | Haiti | HAI |
| C | 4 | Scotland | SCO |
| D | 1 | United States | USA |
| D | 2 | Paraguay | PAR |
| D | 3 | Australia | AUS |
| D | 4 | Türkiye | TUR |
| E | 1 | Germany | GER |
| E | 2 | Curaçao | CUW |
| E | 3 | Côte d'Ivoire | CIV |
| E | 4 | Ecuador | ECU |
| F | 1 | Netherlands | NED |
| F | 2 | Japan | JPN |
| F | 3 | Sweden | SWE |
| F | 4 | Tunisia | TUN |
| G | 1 | Belgium | BEL |
| G | 2 | Egypt | EGY |
| G | 3 | IR Iran | IRN |
| G | 4 | New Zealand | NZL |
| H | 1 | Spain | ESP |
| H | 2 | Cabo Verde | CPV |
| H | 3 | Saudi Arabia | KSA |
| H | 4 | Uruguay | URU |
| I | 1 | France | FRA |
| I | 2 | Senegal | SEN |
| I | 3 | Iraq | IRQ |
| I | 4 | Norway | NOR |
| J | 1 | Argentina | ARG |
| J | 2 | Algeria | ALG |
| J | 3 | Austria | AUT |
| J | 4 | Jordan | JOR |
| K | 1 | Portugal | POR |
| K | 2 | Congo DR | COD |
| K | 3 | Uzbekistan | UZB |
| K | 4 | Colombia | COL |
| L | 1 | England | ENG |
| L | 2 | Croatia | CRO |
| L | 3 | Ghana | GHA |
| L | 4 | Panama | PAN |

### Flag URLs

Use `https://flagcdn.com/w40/{countrycode2}.png` (ISO 3166-1 alpha-2 lowercase). Examples: Brazil = `br`, Argentina = `ar`, England = `gb-eng`, Scotland = `gb-sct`. For special cases like England/Scotland use the GB subdivision codes.

---
## 📅 Full Match Schedule (Group Stage — seed this exactly)

All times stored as UTC. The schedule below is in PT — convert to UTC (+7hrs for PT).

| # | Date (PT) | Time (PT) | Team 1 | Team 2 | Venue | City |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| 1 | Jun 11 | 12:00PM | Mexico | South Africa | Estadio Azteca | Mexico City |
| 2 | Jun 11 | 7:00PM | Korea Republic | Czechia | Estadio Akron | Guadalajara |
| 3 | Jun 12 | 12:00PM | Canada | Bosnia & Herzegovina | BMO Field | Toronto |
| 4 | Jun 12 | 6:00PM | United States | Paraguay | SoFi Stadium | Inglewood |
| 5 | Jun 13 | 12:00PM | Qatar | Switzerland | Levi's Stadium | Santa Clara |
| 6 | Jun 13 | 3:00PM | Brazil | Morocco | MetLife Stadium | East Rutherford |
| 7 | Jun 13 | 6:00PM | Haiti | Scotland | Gillette Stadium | Foxborough |
| 8 | Jun 13 | 9:00PM | Australia | Türkiye | BC Place | Vancouver |
| 9 | Jun 14 | 10:00AM | Germany | Curaçao | NRG Stadium | Houston |
| 10 | Jun 14 | 1:00PM | Netherlands | Japan | AT&T Stadium | Arlington |
| 11 | Jun 14 | 4:00PM | Côte d'Ivoire | Ecuador | Lincoln Financial Field | Philadelphia |
| 12 | Jun 14 | 7:00PM | Sweden | Tunisia | Estadio BBVA Bancomer | Monterrey |
| 13 | Jun 15 | 9:00AM | Spain | Cabo Verde | Mercedes-Benz Stadium | Atlanta |
| 14 | Jun 15 | 12:00PM | Belgium | Egypt | Lumen Field | Seattle |
| 15 | Jun 15 | 3:00PM | Saudi Arabia | Uruguay | Hard Rock Stadium | Miami |
| 16 | Jun 15 | 6:00PM | IR Iran | New Zealand | SoFi Stadium | Inglewood |
| 17 | Jun 16 | 12:00PM | France | Senegal | MetLife Stadium | East Rutherford |
| 18 | Jun 16 | 3:00PM | Iraq | Norway | Gillette Stadium | Foxborough |
| 19 | Jun 16 | 6:00PM | Argentina | Algeria | Arrowhead Stadium | Kansas City |
| 20 | Jun 16 | 9:00PM | Austria | Jordan | Levi's Stadium | Santa Clara |
| 21 | Jun 17 | 10:00AM | Portugal | Congo DR | NRG Stadium | Houston |
| 22 | Jun 17 | 1:00PM | England | Croatia | AT&T Stadium | Arlington |
| 23 | Jun 17 | 4:00PM | Ghana | Panama | BMO Field | Toronto |
| 24 | Jun 17 | 7:00PM | Uzbekistan | Colombia | Estadio Azteca | Mexico City |
| 25 | Jun 18 | 9:00AM | Czechia | South Africa | Mercedes-Benz Stadium | Atlanta |
| 26 | Jun 18 | 12:00PM | Switzerland | Bosnia & Herzegovina | SoFi Stadium | Inglewood |
| 27 | Jun 18 | 3:00PM | Canada | Qatar | BC Place | Vancouver |
| 28 | Jun 18 | 6:00PM | Mexico | Korea Republic | Estadio Akron | Guadalajara |
| 29 | Jun 19 | 12:00PM | United States | Australia | Lumen Field | Seattle |
| 30 | Jun 19 | 3:00PM | Scotland | Morocco | Gillette Stadium | Foxborough |
| 31 | Jun 19 | 6:30PM | Brazil | Haiti | Lincoln Financial Field | Philadelphia |
| 32 | Jun 19 | 8:00PM | Türkiye | Paraguay | Levi's Stadium | Santa Clara |
| 33 | Jun 20 | 10:00AM | Netherlands | Sweden | NRG Stadium | Houston |
| 34 | Jun 20 | 1:00PM | Germany | Côte d'Ivoire | BMO Field | Toronto |
| 35 | Jun 20 | 5:00PM | Ecuador | Curaçao | Arrowhead Stadium | Kansas City |
| 36 | Jun 20 | 9:00PM | Tunisia | Japan | Estadio BBVA Bancomer | Monterrey |
| 37 | Jun 21 | 9:00AM | Spain | Saudi Arabia | Mercedes-Benz Stadium | Atlanta |
| 38 | Jun 21 | 12:00PM | Belgium | IR Iran | SoFi Stadium | Inglewood |
| 39 | Jun 21 | 3:00PM | Uruguay | Cabo Verde | Hard Rock Stadium | Miami |
| 40 | Jun 21 | 6:00PM | New Zealand | Egypt | BC Place | Vancouver |
| 41 | Jun 22 | 10:00AM | Argentina | Austria | AT&T Stadium | Arlington |
| 42 | Jun 22 | 2:00PM | France | Iraq | Lincoln Financial Field | Philadelphia |
| 43 | Jun 22 | 5:00PM | Norway | Senegal | MetLife Stadium | East Rutherford |
| 44 | Jun 22 | 8:00PM | Jordan | Algeria | Levi's Stadium | Santa Clara |
| 45 | Jun 23 | 10:00AM | Portugal | Uzbekistan | NRG Stadium | Houston |
| 46 | Jun 23 | 1:00PM | England | Ghana | Gillette Stadium | Foxborough |
| 47 | Jun 23 | 4:00PM | Panama | Croatia | BMO Field | Toronto |
| 48 | Jun 23 | 7:00PM | Colombia | Congo DR | Estadio Akron | Guadalajara |
| 49 | Jun 24 | 12:00PM | Switzerland | Canada | BC Place | Vancouver |
| 50 | Jun 24 | 12:00PM | Bosnia & Herzegovina | Qatar | Lumen Field | Seattle |
| 51 | Jun 24 | 3:00PM | Scotland | Brazil | Hard Rock Stadium | Miami |
| 52 | Jun 24 | 3:00PM | Morocco | Haiti | Mercedes-Benz Stadium | Atlanta |
| 53 | Jun 24 | 6:00PM | Czechia | Mexico | Estadio Azteca | Mexico City |
| 54 | Jun 24 | 6:00PM | South Africa | Korea Republic | Estadio BBVA Bancomer | Monterrey |
| 55 | Jun 25 | 1:00PM | Ecuador | Germany | MetLife Stadium | East Rutherford |
| 56 | Jun 25 | 1:00PM | Curaçao | Côte d'Ivoire | Lincoln Financial Field | Philadelphia |
| 57 | Jun 25 | 4:00PM | Tunisia | Netherlands | Arrowhead Stadium | Kansas City |
| 58 | Jun 25 | 4:00PM | Japan | Sweden | AT&T Stadium | Arlington |
| 59 | Jun 25 | 7:00PM | Türkiye | United States | SoFi Stadium | Inglewood |
| 60 | Jun 25 | 7:00PM | Paraguay | Australia | Levi's Stadium | Santa Clara |
| 61 | Jun 26 | 12:00PM | Norway | France | Gillette Stadium | Foxborough |
| 62 | Jun 26 | 12:00PM | Senegal | Iraq | BMO Field | Toronto |
| 63 | Jun 26 | 5:00PM | Uruguay | Spain | Estadio Akron | Guadalajara |
| 64 | Jun 26 | 5:00PM | Cabo Verde | Saudi Arabia | NRG Stadium | Houston |
| 65 | Jun 26 | 8:00PM | New Zealand | Belgium | BC Place | Vancouver |
| 66 | Jun 26 | 8:00PM | Egypt | IR Iran | Lumen Field | Seattle |
| 67 | Jun 27 | 2:00PM | Panama | England | MetLife Stadium | East Rutherford |
| 68 | Jun 27 | 2:00PM | Croatia | Ghana | Lincoln Financial Field | Philadelphia |
| 69 | Jun 27 | 4:30PM | Colombia | Portugal | Hard Rock Stadium | Miami |
| 70 | Jun 27 | 4:30PM | Congo DR | Uzbekistan | Mercedes-Benz Stadium | Atlanta |
| 71 | Jun 27 | 8:00PM | Jordan | Argentina | AT&T Stadium | Arlington |
| 72 | Jun 27 | 8:00PM | Algeria | Austria | Arrowhead Stadium | Kansas City |

### Knockout Stage Matches

Seed these with NULL team IDs (to be filled in as tournament progresses). Round of 32 has 16 matches (Jun 28 – Jul 3), R16 has 8 (Jul 4–7), QF has 4 (Jul 9–11), SF has 2 (Jul 14–15), Final 1 (Jul 19).

---
## 🎯 Points System

| Round | Points for correct prediction |
| ------------- | ------------- |
| GROUP | 1 |
| R32 | 2 |
| R16 | 3 |
| QF | 4 |
| SF | 6 |
| FINAL | 10 |

When `PATCH /api/matches/:id/result` is called OR live sync detects a finished match:
1. Update match: score + actualWinnerId + isLocked = true
2. Find all predictions for that matchId
3. For each: `is_correct = (predictedWinnerId === actualWinnerId)`
4. `points_earned` = round points if correct, 0 if incorrect
---
## 🌐 Live Match Sync (football-data.org)
### Endpoint

`GET https://api.football-data.org/v4/competitions/WC/matches` Header: `X-Auth-Token: {FOOTBALL_DATA_API_KEY}`

### Sync Logic (in `syncService.ts`)
```
1. Fetch all WC matches from football-data.org
2. For each match with status = "FINISHED":
 a. Find our match by external_id
 b. If our match is not yet locked:
 - Update team1_score, team2_score
 - Set actual_winner_id based on score (or null for draw in group)
 - Set is_locked = true
 - Trigger predictionScoring for this match
3. Return count of updated matches

```
### When to call sync
- Admin manually triggers `POST /api/matches/sync-live`
- (Optional later) Cron job every 5 minutes during tournament
---
## 🔮 Prediction Rules
1. ALL users (including guests) see the full prediction bracket UI and can interact with it
2.  2. Only signed-up users have their picks saved — guest picks live in localStorage only 
3. 3. When a guest signs up, their localStorage picks are submitted automatically 
4. Signed-up users' predictions are stored per-round and can be toggled by round in the UI. 
5. Predictions can be **edited** anytime before a match locks
6. Locked matches (`is_locked = true`) are silently skipped in batch submit
7. `predictedWinnerId` must be `team1_id` OR `team2_id` of that match — validated server-side
8. Each user has **one prediction per match** — UPSERT on `(user_id, match_id)`
9. Knockout matches with null team IDs cannot be predicted yet (skip silently)


---

## 🔄 Prediction Round States

The predict page has round tabs the user can toggle between:
- GROUP STAGE (72 matches across 12 groups)
- ROUND OF 32 (16 matches)
- ROUND OF 16 (8 matches)
- QUARTER-FINALS (4 matches)
- SEMI-FINALS (2 matches)
- FINAL (1 match)

Each round tab shows only that round's matches.
Locked matches show results + accuracy overlay.
Unlocked matches show prediction slots.
Progress per round: "X of Y predicted in this round"

---


## 📸 Player Images

The official FIFA player photo URL pattern is:
`https://digitalhub.fifa.com/m/[hash]/[playerid].png`

Since these are not publicly accessible without auth, use this fallback strategy:
1. Try: `https://img.sofascore.com/api/v1/player/{sofascore_id}/image` (requires ID mapping)
2. Fallback: generated avatar using player's shirt name initials
   - Backend stores `photo_url` as null initially
   - Frontend renders a position-colored letter avatar when photo_url is null:
     GK = yellow, DF = blue, MF = green, FW = red
   - Admin can bulk-update photo URLs via `PATCH /api/players/:id/photo` later
   - Best practical option: use Wikipedia/Wikimedia player images where available,
     or leave null and rely on the letter avatar — this is fine for v1

For v1: seed photo_url as null for all players. The letter avatar system handles it cleanly.
For v2: consider using the football-data.org player endpoint which sometimes has photo links.

---


## 🏗️ Backend Project Structure
```
/backend/src
 /config
 db.ts → Neon DB pool (use 'pg' package)
 auth.ts → Better Auth config
 /middleware
 authMiddleware.ts → Verify JWT, attach req.user
 adminMiddleware.ts → Check role === 'ADMIN', return 403
 errorHandler.ts → Global error handler
 /routes
 auth.ts, users.ts, teams.ts, players.ts,
 matches.ts, predictions.ts, comments.ts
 /controllers → one file per route
 /services
 predictionScoring.ts → score predictions when match result set
 syncService.ts → football-data.org live sync
 statsService.ts → popular picks aggregation
 /types
 index.ts → shared types (copy from PROJECT.md)
 /seeds
 teams.seed.ts → 48 teams with groups (see group table above)
 players.seed.ts → all 48 squads (26 players each, from squad list)
 matches.seed.ts → 72 group stage matches + knockout shells
 index.ts

```
---
## 🎨 Frontend Project Structure
```
/frontend/src
 /app
 / → Landing page
 /login → Login
 /register → Register
 /predict → Full bracket prediction UI (auth required)
 /bracket → Public bracket view (limited for guests)
 /stats → Public popular picks
 /teams/[id] → Team + squad (auth required)
 /profile → My predictions + accuracy (auth required)
 /admin → Admin panel (admin only)
 /components
 /ui → Button, Input, Badge, Card, Modal, Spinner, Avatar
 /bracket → BracketView, MatchCard, PredictionSlot, RoundColumn, AccuracyBadge
 /teams → TeamCard, PlayerCard
 /comments → CommentThread, CommentForm, ReactionBar
 /auth → AuthGuard, AdminGuard
 /lib
 api.ts → typed fetch wrapper for all endpoints
 auth.ts → token helpers
 /types
 index.ts → shared types (copy from PROJECT.md)
 /hooks
 useAuth.ts, usePredictions.ts, useMatches.ts

```
---
## 🗺️ Build Order
```
Phase 1 — Foundation
 [ ] Neon DB setup + run migrations
 [ ] Seed teams (48), players (all squads), matches (72 group + knockout shells)
 [ ] Better Auth + JWT middleware

Phase 2 — Core API
 [ ] Auth endpoints
 [ ] Teams + Players endpoints
 [ ] Matches endpoints
 [ ] Predictions endpoints (batch upsert)

Phase 3 — Frontend Shell
 [ ] Next.js + Tailwind setup
 [ ] Shared types + api.ts wrapper
 [ ] useAuth hook + auth context
 [ ] Login + Register pages
 [ ] AuthGuard component

Phase 4 — Bracket UI
 [ ] Landing page
 [ ] Full bracket predict page (/predict)
 [ ] Public bracket view (/bracket)
 [ ] Team/Player detail pages

Phase 5 — Social
 [ ] Comments + reactions API
 [ ] CommentThread + ReactionBar UI

Phase 6 — Stats & Accuracy
 [ ] Stats endpoint + page
 [ ] Accuracy overlay on locked matches

Phase 7 — Admin
 [ ] Admin panel: update results, lock matches, trigger sync
 [ ] Live sync service (football-data.org)

Phase 8 — Polish
 [ ] Avatar fallback (first letter)
 [ ] Avatar upload
 [ ] Mobile responsiveness

```
---
## ⚠️ Important Notes for Both Agents
- **48 teams, 12 groups (A–L), 4 teams each** — 2026 expanded format
- **72 group stage matches** — each team plays 3
- **Knockout: R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1)**
- Never expose `password_hash` in any response
- All timestamps stored in UTC, returned as ISO 8601 strings
- CORS: backend allows `http://localhost:3000` with credentials
- UUIDs always generated by DB (`gen_random_uuid()`)
- Avatar: `avatarUrl = null` means show first letter of username on frontend
- Flag URLs: `https://flagcdn.com/w40/{iso2}.png` — use ISO 3166-1 alpha-2 lowercasead