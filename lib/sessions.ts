import { nanoid } from 'nanoid';

export interface Session {
  id: string;
  githubUrl: string;
  createdAt: number;
  lastModified: number;
  nodes: any[]; // Will be typed properly when we add React Flow
  edges: any[]; // Will be typed properly when we add React Flow
}

const STORAGE_KEY = 'launchify_sessions';

/**
 * Create a new session for a GitHub repository
 */
export function createSession(githubUrl: string): Session {
  const session: Session = {
    id: nanoid(),
    githubUrl,
    createdAt: Date.now(),
    lastModified: Date.now(),
    nodes: [],
    edges: [],
  };

  // Persist to local storage
  saveSession(session);
  return session;
}

/**
 * Get a session by ID
 */
export function getSession(id: string): Session | null {
  if (typeof window === 'undefined') return null;

  const sessions = getAllSessions();
  return sessions.find((s) => s.id === id) || null;
}

/**
 * Get all sessions
 */
export function getAllSessions(): Session[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load sessions', e);
    return [];
  }
}

/**
 * Save/Update a session
 */
export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;

  try {
    const sessions = getAllSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
      sessions[index] = { ...session, lastModified: Date.now() };
    } else {
      sessions.push(session);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}
