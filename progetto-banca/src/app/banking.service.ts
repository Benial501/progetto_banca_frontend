import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap
} from 'rxjs';
import { AuthService } from './auth.service';

export interface Transazione {
  id: number;
  tipo: 'deposito' | 'prelievo' | 'conversione';
  importo: number;
  descrizione: string;
  data: Date;
  saldoDopo: number;
}

export type PrelievoFailureReason =
  | 'invalid_amount'
  | 'insufficient_balance'
  | 'no_account'
  | 'unknown';

export type PrelievoResult =
  | { success: true }
  | { success: false; reason: PrelievoFailureReason };

function prelievoOk(): PrelievoResult {
  return { success: true };
}

function prelievoErr(reason: PrelievoFailureReason): PrelievoResult {
  return { success: false, reason };
}

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private readonly apiBaseUrl = 'https://bankingapi-production-2687.up.railway.app';
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  private readonly transazioniSubject = new BehaviorSubject<Transazione[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  /** Lista movimenti: aggiornata da refresh e dopo deposito/prelievo riusciti. */
  readonly transazioni$ = this.transazioniSubject.asObservable();

  readonly transazioniLoading$ = this.loadingSubject.asObservable();

  /** Saldo corrente derivato dal movimento più recente (primo elemento dopo ordinamento API). */
  readonly saldo$: Observable<number> = this.transazioni$.pipe(
    map((list) => list[0]?.saldoDopo ?? 0),
    distinctUntilChanged()
  );

  private transazioniFallback: Transazione[] = [
    {
      id: 1,
      tipo: 'deposito',
      importo: 2500,
      descrizione: 'Stipendio',
      data: new Date('2024-05-15'),
      saldoDopo: 2500
    },
    {
      id: 2,
      tipo: 'prelievo',
      importo: -85.3,
      descrizione: 'Supermercato',
      data: new Date('2024-05-14'),
      saldoDopo: 2414.7
    }
  ];

  tassiFiat: { [key: string]: number } = {
    EUR: 1,
    USD: 1.0865,
    GBP: 0.8523,
    JPY: 156.78
  };

  prezziCripto: { [key: string]: number } = {
    BTC: 45230.5,
    ETH: 2456.78,
    BNB: 312.45,
    ADA: 0.45
  };

  private get accountId(): number | null {
    return this.auth.getAccountId();
  }

  /** Svuota lo stato (es. logout) senza chiamate HTTP. */
  resetState(): void {
    this.transazioniSubject.next([]);
    this.loadingSubject.next(false);
  }

  /** Aggiorna lista da API e notifica i subscriber tramite BehaviorSubject. */
  refreshTransazioni(): Observable<Transazione[]> {
    const accountId = this.accountId;
    if (accountId == null) {
      this.transazioniSubject.next([]);
      return of([]);
    }

    this.loadingSubject.next(true);
    return this.http.get<unknown>(`${this.apiBaseUrl}/accounts/${accountId}/transactions`).pipe(
      map((body) => this.mapTransazioniApi(this.normalizeTransactionsRows(body))),
      tap((list) => this.transazioniSubject.next(list)),
      catchError(() => {
        const fb = [...this.transazioniFallback].reverse();
        this.transazioniSubject.next(fb);
        return of(fb);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getSaldo(): Observable<number> {
    return this.refreshTransazioni().pipe(map((list) => list[0]?.saldoDopo ?? 0));
  }

  getTransazioni(): Observable<Transazione[]> {
    return this.refreshTransazioni();
  }

  getTransazioneById(id: number, forceRemote = false): Observable<Transazione | undefined> {
    const accountId = this.accountId;
    if (accountId == null) {
      return of(undefined);
    }

    if (!forceRemote) {
      const cached = this.transazioniSubject.getValue().find((t) => t.id === id);
      if (cached) {
        return of(cached);
      }
    }

    return this.http
      .get<unknown>(`${this.apiBaseUrl}/accounts/${accountId}/transactions/${id}`)
      .pipe(
        map((body) => this.mapTransazioniApi(this.normalizeTransactionsRows(body))[0]),
        catchError(() =>
          of(this.transazioniSubject.getValue().find((transazione) => transazione.id === id))
        )
      );
  }

  deposito(importo: number, descrizione: string = 'Deposito'): Observable<boolean> {
    const accountId = this.accountId;
    if (accountId == null || importo <= 0) {
      return of(false);
    }

    const payload = { amount: importo, description: descrizione };

    return this.http.post(`${this.apiBaseUrl}/accounts/${accountId}/deposits`, payload).pipe(
      map(() => true),
      catchError(() => {
        const saldoCorrente = this.getSaldoFallback();
        const transazione: Transazione = {
          id: this.transazioniFallback.length + 1,
          tipo: 'deposito',
          importo,
          descrizione,
          data: new Date(),
          saldoDopo: saldoCorrente + importo
        };
        this.transazioniFallback.push(transazione);
        return of(true);
      }),
      switchMap((esito) => this.refreshTransazioni().pipe(map(() => esito)))
    );
  }

  prelievo(importo: number, descrizione: string = 'Prelievo'): Observable<PrelievoResult> {
    const accountId = this.accountId;
    if (accountId == null) {
      return of(prelievoErr('no_account'));
    }
    if (importo <= 0) {
      return of(prelievoErr('invalid_amount'));
    }

    const payload = { amount: importo, description: descrizione };

    return this.http
      .post(`${this.apiBaseUrl}/accounts/${accountId}/withdrawals`, payload)
      .pipe(
        map((): PrelievoResult => prelievoOk()),
        catchError((err: unknown): Observable<PrelievoResult> => {
          if (this.isInsufficientBalanceError(err)) {
            return of(prelievoErr('insufficient_balance'));
          }
          return of(prelievoErr('unknown'));
        }),
        switchMap((esito: PrelievoResult) =>
          esito.success
            ? this.refreshTransazioni().pipe(map((): PrelievoResult => prelievoOk()))
            : of(esito)
        )
      );
  }

  getSaldoConvertito(saldo: number, valuta: string): number {
    if (valuta === 'EUR') return saldo;
    return saldo * this.tassiFiat[valuta];
  }

  getSaldoCriptoConvertito(saldo: number, cripto: string): number {
    return saldo / this.prezziCripto[cripto];
  }

  getSimboloValuta(valuta: string): string {
    const simboli: { [key: string]: string } = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥'
    };
    return simboli[valuta] || valuta;
  }

  getNomeCripto(crypto: string): string {
    const nomi: { [key: string]: string } = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      BNB: 'Binance Coin',
      ADA: 'Cardano'
    };
    return nomi[crypto] || crypto;
  }

  private isInsufficientBalanceError(err: unknown): boolean {
    if (!(err instanceof HttpErrorResponse)) {
      return false;
    }
    if (err.status === 400 || err.status === 422 || err.status === 409) {
      const bodyText = JSON.stringify(err.error ?? '').toLowerCase();
      return (
        bodyText.includes('insufficient') ||
        bodyText.includes('insufficiente') ||
        bodyText.includes('saldo') ||
        bodyText.includes('balance') ||
        err.status === 422
      );
    }
    return false;
  }

  private normalizeTransactionsRows(body: unknown): unknown[] {
    if (Array.isArray(body)) {
      return body;
    }
    if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      const nested = obj['transactions'];
      if (Array.isArray(nested)) {
        return nested;
      }
      if (obj['id'] != null && (obj['type'] != null || obj['tipo'] != null)) {
        return [body];
      }
    }
    return [];
  }

  private mapTransazioniApi(apiRows: unknown[]): Transazione[] {
    const rows = Array.isArray(apiRows) ? apiRows : [];

    return rows
      .map((row) => {
        const raw = row as Record<string, unknown>;
        const id = Number(raw['id'] ?? raw['transaction_id'] ?? 0);
        const amountAbs = Math.abs(Number(raw['amount'] ?? raw['importo'] ?? 0));
        const typeRaw = String(raw['type'] ?? raw['tipo'] ?? '');
        const description = String(raw['description'] ?? raw['descrizione'] ?? '');
        const createdAt = String(raw['created_at'] ?? raw['data'] ?? new Date().toISOString());
        const balanceAfter = Number(
          raw['balance_after'] ?? raw['saldo_dopo'] ?? raw['saldoDopo'] ?? 0
        );

        let tipo: Transazione['tipo'] = 'conversione';
        if (typeRaw.includes('deposit')) tipo = 'deposito';
        if (typeRaw.includes('withdraw')) tipo = 'prelievo';

        let importo = amountAbs;
        if (tipo === 'prelievo') {
          importo = -amountAbs;
        } else if (tipo === 'deposito') {
          importo = amountAbs;
        } else {
          importo = Number(raw['amount'] ?? raw['importo'] ?? 0);
        }

        return {
          id,
          tipo,
          importo,
          descrizione: description || (tipo === 'deposito' ? 'Deposito' : 'Prelievo'),
          data: new Date(createdAt),
          saldoDopo: balanceAfter
        } satisfies Transazione;
      })
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  private getSaldoFallback(): number {
    const transazioniOrdinate = [...this.transazioniFallback].sort(
      (a, b) => b.data.getTime() - a.data.getTime()
    );
    return transazioniOrdinate[0]?.saldoDopo ?? 0;
  }
}
