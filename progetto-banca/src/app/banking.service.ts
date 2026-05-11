import { Injectable } from '@angular/core';

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
  private saldoCorrente: number = 2450.67; // Saldo iniziale
  private transazioni: Transazione[] = [
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

  constructor() {}

  getSaldo(): number {
    return this.saldoCorrente;
  }

  getTransazioni(): Transazione[] {
    return [...this.transazioni].reverse(); // Più recenti prima
  }

  deposito(importo: number, descrizione: string = 'Deposito'): boolean {
    if (importo <= 0) return false;

    this.saldoCorrente += importo;
    const transazione: Transazione = {
      id: this.transazioni.length + 1,
      tipo: 'deposito',
      importo: importo,
      descrizione: descrizione,
      data: new Date(),
      saldoDopo: this.saldoCorrente
    };
    this.transazioni.push(transazione);
    return true;
  }

  prelievo(importo: number, descrizione: string = 'Prelievo'): boolean {
    if (importo <= 0 || importo > this.saldoCorrente) return false;

    this.saldoCorrente -= importo;
    const transazione: Transazione = {
      id: this.transazioni.length + 1,
      tipo: 'prelievo',
      importo: -importo,
      descrizione: descrizione,
      data: new Date(),
      saldoDopo: this.saldoCorrente
    };
    this.transazioni.push(transazione);
    return true;
  }

  getSaldoConvertito(valuta: string): number {
    if (valuta === 'EUR') return this.saldoCorrente;
    return this.saldoCorrente * this.tassiFiat[valuta];
  }

  getSaldoCriptoConvertito(cripto: string): number {
    return this.saldoCorrente / this.prezziCripto[cripto];
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
}