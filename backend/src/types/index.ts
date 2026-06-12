export type UserRole = 'USER' | 'ADMIN';
export type PredictionMode = 'LITE' | 'PRO' | 'HYBRID';


export interface UserPublic {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null; // null = show first letter of username as avatar
  role: UserRole;
  predictionMode: PredictionMode;
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
  team1Id: string | null;
  team2Id: string | null;
  team1Name: string | null;
  team2Name: string | null;
  team1Code: string | null;
  team2Code: string | null;
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
  team1: TeamBasic | null;
  team2: TeamBasic | null;
  actualWinner: TeamBasic | null;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedWinnerId: string | null;
  predictedSlot: number | null;
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
  parentId: string | null;
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

export interface AuthTokens {
  token: string; // short-lived access token (15m)
  // refresh token is in httpOnly cookie, not in response body
}

export interface ApiSuccess<T> { success: true; data: T; }
export interface ApiError { success: false; error: string; }
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// JWT payload shape
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
}

// Express Request augmentation
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
