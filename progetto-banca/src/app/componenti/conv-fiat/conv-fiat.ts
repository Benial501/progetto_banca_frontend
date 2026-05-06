import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conv-fiat',
  imports: [FormsModule, CommonModule],
  templateUrl: './conv-fiat.html',
  styleUrl: './conv-fiat.css',
})
export class ConvFiat implements OnInit {
  daValuta: string = 'EUR';
  importo: number = 100;
  aValuta: string = 'USD';

  tassoDiCambio: number = 1.0865;
  totaleFiat: number = 0;
  equivalenteCripto: number = 0;

  // Tassi di cambio fiat (EUR come base)
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

  ngOnInit() {
    this.calcolaConversione();
  }

  onValutaChange() {
    this.aggiornaTasso();
    this.calcolaConversione();
  }

  onImportoChange() {
    this.calcolaConversione();
  }

  aggiornaTasso() {
    if (this.daValuta && this.aValuta) {
      this.tassoDiCambio = this.tassiFiat[this.aValuta] / this.tassiFiat[this.daValuta];
    }
  }

  calcolaConversione() {
    if (this.importo && this.importo > 0) {
      // Converti in EUR prima
      const importoInEur = this.importo / this.tassiFiat[this.daValuta];

      // Converti nella valuta target
      this.totaleFiat = importoInEur * this.tassiFiat[this.aValuta];

      // Calcola equivalente in BTC
      this.equivalenteCripto = importoInEur / this.prezziCripto['BTC'];
    }
  }

  formattaNumero(num: number, decimali: number = 2): string {
    return num.toFixed(decimali);
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
}
