import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, switchMap, tap } from 'rxjs';

export interface Transazione {
  id: number;
  tipo: 'deposito' | 'prelievo' | 'conversione';
  importo: number;
  descrizione: string;
  data: Date;
  saldoDopo: number;
}

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private readonly apiBaseUrl = 'https://bankingapi-production-2687.up.railway.app';
  private readonly accountId = 1;

  private readonly transazioniWritable = signal<Transazione[]>([]);
  readonly transazioni = this.transazioniWritable.asReadonly();
  readonly transazioniLoading = signal(false);

  readonly saldo = computed(() => this.transazioniWritable()[0]?.saldoDopo ?? 0);

  // fallback locale se backend non disponibile
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
      importo: -85.30,
      descrizione: 'Supermercato',
      data: new Date('2024-05-14'),
      saldoDopo: 2414.70
    },
    {
      id: 3,
      tipo: 'deposito',
      importo: 150,
      descrizione: 'Rimborso',
      data: new Date('2024-05-12'),
      saldoDopo: 2564.70
    },
    {
      id: 4,
      tipo: 'prelievo',
      importo: -120.50,
      descrizione: 'Bollette',
      data: new Date('2024-05-10'),
      saldoDopo: 2444.20
    }
  ];

  // Tassi di cambio (EUR come base)
  tassiFiat: { [key: string]: number } = {
    'EUR': 1,
    'USD': 1.0865,
    'GBP': 0.8523,
    'JPY': 156.78
  };

  // Prezzi cripto in EUR
  prezziCripto: { [key: string]: number } = {
    'BTC': 45230.50,
    'ETH': 2456.78,
    'BNB': 312.45,
    'ADA': 0.45
  };

  constructor(private http: HttpClient) {}

  /** Aggiorna i signal da API (o fallback). */
  refreshTransazioni(): Observable<Transazione[]> {
    this.transazioniLoading.set(true);
    return this.http.get<unknown>(`${this.apiBaseUrl}/accounts/${this.accountId}/transactions`).pipe(
      map((body) => this.mapTransazioniApi(this.normalizeTransactionsRows(body))),
      tap((list) => this.transazioniWritable.set(list)),
      catchError(() => {
        const fb = [...this.transazioniFallback].reverse();
        this.transazioniWritable.set(fb);
        return of(fb);
      }),
      finalize(() => this.transazioniLoading.set(false))
    );
  }

  getSaldo(): Observable<number> {
    return this.refreshTransazioni().pipe(map(() => this.saldo()));
  }

  getTransazioni(): Observable<Transazione[]> {
    return this.refreshTransazioni();
  }

  getTransazioneById(id: number): Observable<Transazione | undefined> {
    const cached = this.transazioniWritable().find((t) => t.id === id);
    if (cached) {
      return of(cached);
    }

    return this.http
      .get<unknown>(`${this.apiBaseUrl}/accounts/${this.accountId}/transactions/${id}`)
      .pipe(
        map((body) => this.mapTransazioniApi(this.normalizeTransactionsRows(body))[0]),
        catchError(() =>
          of(this.transazioniWritable().find((transazione) => transazione.id === id))
        )
      );
  }

  deposito(importo: number, descrizione: string = 'Deposito'): Observable<boolean> {
    if (importo <= 0) {
      return of(false);
    }

    const payload = {
      amount: importo,
      description: descrizione
    };

    return this.http
      .post(`${this.apiBaseUrl}/accounts/${this.accountId}/deposits`, payload)
      .pipe(
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

  prelievo(importo: number, descrizione: string = 'Prelievo'): Observable<boolean> {
    if (importo <= 0) {
      return of(false);
    }

    const payload = {
      amount: importo,
      description: descrizione
    };

    return this.http
      .post(`${this.apiBaseUrl}/accounts/${this.accountId}/withdrawals`, payload)
      .pipe(
        map(() => true),
        catchError(() => {
          const saldoCorrente = this.getSaldoFallback();
          const transazione: Transazione = {
            id: this.transazioniFallback.length + 1,
            tipo: 'prelievo',
            importo: -importo,
            descrizione,
            data: new Date(),
            saldoDopo: saldoCorrente - importo
          };
          this.transazioniFallback.push(transazione);
          return of(true);
        }),
        switchMap((esito) => this.refreshTransazioni().pipe(map(() => esito)))
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
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'JPY': '¥'
    };
    return simboli[valuta] || valuta;
  }

  getNomeCripto(crypto: string): string {
    const nomi: { [key: string]: string } = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'ADA': 'Cardano'
    };
    return nomi[crypto] || crypto;
  }

  /** Accetta array diretto, wrapper `{ transactions }` o singola transazione (dettaglio). */
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
