import { Injectable } from '@angular/core';

const SESSION_KEY = 'banking_session';
const USERS_KEY = 'banking_users';

export interface AuthSession {
  email: string;
  displayName: string;
}

interface StoredUser {
  email: string;
  password: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  getSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed?.email && parsed?.displayName) {
        return { email: parsed.email, displayName: parsed.displayName };
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  login(email: string, password: string): { ok: true } | { ok: false; message: string } {
    const users = this.readUsers();
    const normalized = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalized);
    if (!user || user.password !== password) {
      return { ok: false, message: 'Email o password non corretti.' };
    }
    const session: AuthSession = {
      email: user.email,
      displayName: user.displayName
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true };
  }

  register(
    email: string,
    password: string,
    displayName: string
  ): { ok: true } | { ok: false; message: string } {
    const normalized = email.trim().toLowerCase();
    const name = displayName.trim();

    if (!normalized || !name) {
      return { ok: false, message: 'Compila tutti i campi obbligatori.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { ok: false, message: 'Inserisci un indirizzo email valido.' };
    }
    if (password.length < 6) {
      return { ok: false, message: 'La password deve avere almeno 6 caratteri.' };
    }

    const users = this.readUsers();
    if (users.some((u) => u.email === normalized)) {
      return { ok: false, message: 'Questa email è già registrata.' };
    }

    users.push({ email: normalized, password, displayName: name });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const session: AuthSession = { email: normalized, displayName: name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true };
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  private readUsers(): StoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      return [];
    }
  }
}
