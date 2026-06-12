import { 
  ApiResponse, 
  UserPublic,
  TeamBasic, 
  TeamFull, 
  Player, 
  Round, 
  MatchBasic, 
  MatchFull, 
  PredictionWithMatch, 
  AccuracyStats,
  CommentWithReactions,
  ReactionType
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function apiFetch<T>(
  path: string, 
  options?: RequestInit, 
  token?: string, 
  setToken?: (t: string | null) => void
): Promise<ApiResponse<T>> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers ?? {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include', // Always include so refresh cookie is sent
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Auto-refresh on 401
    if (res.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const { data } = await refreshRes.json();
        if (setToken && data.token) {
          setToken(data.token); // update token in auth context
          // Retry original request with new token
          return apiFetch<T>(path, options, data.token, setToken);
        }
      }
    }

    // Handle errors that are not 2xx
    if (!res.ok) {
      try {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'An error occurred' };
      } catch {
        return { success: false, error: `HTTP error! status: ${res.status}` };
      }
    }

    return await res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timed out' };
    }
    return { success: false, error: 'Server unavailable or network error' };
  }
}

// Auth
export const login = (data: any) => apiFetch<{ user: any, token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data: any) => apiFetch<{ user: any, token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => apiFetch<{ success: true }>('/auth/logout', { method: 'POST' });
export const refresh = () => apiFetch<{ token: string }>('/auth/refresh', { method: 'POST' });

// Teams
export const getTeams = () => apiFetch<{ teams: TeamBasic[] }>('/teams');
export const getTeam = (id: string, token?: string) => 
  apiFetch<{ team: TeamFull; players: Player[] }>(`/teams/${id}`, {}, token);
export const getTeamsByGroup = (groupName: string) => 
  apiFetch<{ group: string, teams: TeamBasic[] }>(`/teams/group/${groupName}`);

// Matches
export const getMatches = (round?: Round, group?: string) => {
  let query = '';
  if (round || group) {
    const params = new URLSearchParams();
    if (round) params.append('round', round);
    if (group) params.append('group', group);
    query = `?${params.toString()}`;
  }
  return apiFetch<{ matches: MatchBasic[] }>(`/matches${query}`);
};

export const getMatch = (id: string, token: string) => 
  apiFetch<{ match: MatchFull }>(`/matches/${id}`, {}, token);

// Predictions
export const submitPredictions = (
  token: string, 
  predictions: Array<{ matchId: string, predictedWinnerId?: string | null, predictedSlot?: number | null }>
) =>
  apiFetch<{ saved: number, skipped: number }>('/predictions', { 
    method: 'POST', 
    body: JSON.stringify({ predictions }) 
  }, token);

export const getMyPredictions = (token: string) => 
  apiFetch<{ predictions: PredictionWithMatch[] }>('/predictions/me', {}, token);

export const getMyAccuracy = (token: string) => 
  apiFetch<AccuracyStats>('/predictions/me/accuracy', {}, token);

export const getStats = () => 
  apiFetch<{ topPickedWinner: TeamBasic; popularPicks: any[]; totalPredictors: number }>('/predictions/stats');

// Users
export const getMe = (token: string) => apiFetch<{ user: UserPublic }>('/users/me', {}, token);
export const updateProfile = (token: string, data: { username?: string; email?: string }) => 
  apiFetch<{ user: UserPublic }>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }, token);

export const updateAvatar = (token: string, avatarUrl: string) => 
  apiFetch<{ user: UserPublic }>('/users/me/avatar', { method: 'PATCH', body: JSON.stringify({ avatarUrl }) }, token);

export const updatePredictionMode = (mode: string, token: string) =>
  apiFetch<{ user: UserPublic }>('/users/me/mode', { method: 'PATCH', body: JSON.stringify({ mode }) }, token);

// Lite Mode Predictions
export const submitLitePredictions = (token: string, selections: Record<string, string[]>) =>
  apiFetch<{ saved: number }>('/predictions/lite/groups', { 
    method: 'POST', 
    body: JSON.stringify({ selections }) 
  }, token);

export const getMyLitePredictions = (token: string) =>
  apiFetch<{ predictions: any[] }>('/predictions/lite/me', {}, token);


// Comments
export const getComments = (token: string, matchId?: string) => 
  apiFetch<{ comments: CommentWithReactions[] }>(`/comments${matchId ? `?matchId=${matchId}` : ''}`, {}, token);

export const postComment = (token: string, payload: { content: string; matchId?: string; parentId?: string }) => 
  apiFetch<{ comment: CommentWithReactions }>('/comments', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  }, token);

export const deleteComment = (token: string, id: string) => 
  apiFetch<{ success: true }>(`/comments/${id}`, { method: 'DELETE' }, token);

export const reactToComment = (token: string, id: string, type: ReactionType) => 
  apiFetch<{ reaction: any, counts: { LIKE: number, LOVE: number } }>(`/comments/${id}/react`, { 
    method: 'POST', 
    body: JSON.stringify({ type }) 
  }, token);

// Admin
export const updateMatchResult = (token: string, id: string, data: { team1Score: number, team2Score: number, actualWinnerId: string | null }) =>
  apiFetch<{ match: MatchFull }>(`/matches/${id}/result`, { method: 'PATCH', body: JSON.stringify(data) }, token);

export const lockMatch = (token: string, id: string, isLocked: boolean) =>
  apiFetch<{ match: MatchBasic }>(`/matches/${id}/lock`, { method: 'PATCH', body: JSON.stringify({ isLocked }) }, token);

export const syncLiveMatches = (token: string) =>
  apiFetch<{ updated: number, message: string }>('/matches/sync-live', { method: 'POST' }, token);
