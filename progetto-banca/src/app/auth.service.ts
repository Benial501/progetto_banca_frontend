import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, timeout } from 'rxjs';

function isTimeoutError(err: unknown): boolean {
  return err instanceof Error && err.name === 'TimeoutError';
}

const SESSION_KEY = 'banking_session';
const API_BASE_URL = 'https://bankingapi-production-2687.up.railway.app';

/** Timeout richiesta login: evita attese indefinite se il server non risponde. */
const LOGIN_HTTP_TIMEOUT_MS = 12_000;

export interface AuthSession {
  accountId: number;
  displayName: string;
  currency?: string;
}

export type LoginResult =
  | { ok: true }
  | {
      ok: false;
      code: 'invalid_id' | 'account_not_found' | 'login_timeout' | 'network_error';
    };

interface BalanceResponse {
  account_id?: number;
  owner_name?: string;
  currency?: string;
}

/** Risposta POST /accounts come da backend (allineato a createAccountWithCurrency). */
interface CreateAccountApiResponse {
  message?: string;
  accountId?: number;
  owner_name?: string;
  currency?: string;
}

/** Valute supportate dall’app (allineate ai tassi in BankingService). */
export const REGISTRATION_CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY'] as const;
export type RegistrationCurrency = (typeof REGISTRATION_CURRENCIES)[number];

function readErrorMessage(err: unknown): string | null {
  if (!(err instanceof HttpErrorResponse) || err.error == null) {
    return null;
  }
  if (typeof err.error === 'string') {
    const t = err.error.trim();
    return t || null;
  }
  if (typeof err.error === 'object' && 'message' in err.error) {
    const m = String((err.error as { message?: string }).message ?? '').trim();
    return m || null;
  }
  return null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  getSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<AuthSession> & { email?: string };
      const accountId = Number(parsed.accountId);
      const displayName = String(parsed.displayName ?? '').trim();
      if (Number.isFinite(accountId) && accountId > 0 && displayName) {
        const currency =
          typeof parsed.currency === 'string' && parsed.currency.trim()
            ? parsed.currency.trim().toUpperCase()
            : undefined;
        return { accountId, displayName, currency };
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  getAccountId(): number | null {
    return this.getSession()?.accountId ?? null;
  }

  login(accountNumber: string | number): Observable<LoginResult> {
    const accountId = Number(String(accountNumber ?? '').trim());
    if (!Number.isFinite(accountId) || accountId <= 0) {
      return of({ ok: false, code: 'invalid_id' });
    }

    return this.http
      .get<BalanceResponse>(`${API_BASE_URL}/accounts/${accountId}/balance`)
      .pipe(
        timeout(LOGIN_HTTP_TIMEOUT_MS),
        map((data): LoginResult => {
          const session: AuthSession = {
            accountId,
            displayName: String(data.owner_name ?? `Conto ${accountId}`).trim(),
            currency:
              typeof data.currency === 'string' && data.currency.trim()
                ? data.currency.trim().toUpperCase()
                : undefined
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          return { ok: true };
        }),
        catchError((err: unknown): Observable<LoginResult> => {
          if (isTimeoutError(err)) {
            return of({ ok: false, code: 'login_timeout' });
          }
          if (err instanceof HttpErrorResponse) {
            if (err.status === 404) {
              return of({ ok: false, code: 'account_not_found' });
            }
            return of({ ok: false, code: 'network_error' });
          }
          return of({ ok: false, code: 'network_error' });
        })
      );
  }

  /**
   * Crea conto: body come backend — `{ owner_name, currency }`.
   * Risposta attesa: `{ accountId?, owner_name?, currency?, message? }`.
   */
  register(
    ownerName: string,
    currency: string
  ): Observable<{ ok: true; accountId: number } | { ok: false; message: string }> {
    const owner_name = ownerName.trim();
    const curr = currency.trim().toUpperCase();

    if (!owner_name) {
      return of({ ok: false, message: 'Inserisci il tuo nome.' });
    }
    if (!REGISTRATION_CURRENCIES.includes(curr as RegistrationCurrency)) {
      return of({ ok: false, message: 'Seleziona una valuta valida per il conto.' });
    }

    return this.http
      .post<CreateAccountApiResponse>(`${API_BASE_URL}/accounts`, { owner_name, currency: curr })
      .pipe(
        timeout(LOGIN_HTTP_TIMEOUT_MS),
        map((res) => {
          const accountId = Number(res.accountId);
          if (!Number.isFinite(accountId) || accountId <= 0) {
            const msg = res.message?.trim();
            return {
              ok: false as const,
              message: msg || 'Risposta del server non valida. Riprova.'
            };
          }
          const displayName = String(res.owner_name ?? owner_name).trim();
          const sessionCurrency = String(res.currency ?? curr).toUpperCase();
          const session: AuthSession = {
            accountId,
            displayName,
            currency: sessionCurrency
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          return { ok: true as const, accountId };
        }),
        catchError((err: unknown) => {
          if (isTimeoutError(err)) {
            return of({ ok: false as const, message: 'Timeout: il server non ha risposto in tempo.' });
          }
          const apiMsg = readErrorMessage(err);
          if (apiMsg) {
            return of({ ok: false as const, message: apiMsg });
          }
          return of({ ok: false as const, message: 'Registrazione non riuscita. Riprova più tardi.' });
        })
      );
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}
