import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conv-cripto',
  imports: [FormsModule, CommonModule],
  templateUrl: './conv-cripto.html',
  styleUrl: './conv-cripto.css',
})
export class ConvCripto implements OnInit {
  daCripto: string = 'BTC';
  quantita: number = 0.001;
  aValuta: string = 'EUR';

  prezzoAttuale: number = 45230.50;
  totaleFiat: number = 0;
  equivalenteAltraCripto: number = 0;

  // Prezzi cripto in EUR
  prezziCripto: { [key: string]: number } = {
    'BTC': 45230.50,
    'ETH': 2456.78,
    'BNB': 312.45,
    'ADA': 0.45
  };

  // Tassi di cambio fiat (EUR come base)
  tassiFiat: { [key: string]: number } = {
    'EUR': 1,
    'USD': 1.0865,
    'GBP': 0.8523,
    'JPY': 156.78
  };

  ngOnInit() {
    this.calcolaConversione();
  }

  onCriptoChange() {
    this.aggiornaPrezzo();
    this.calcolaConversione();
  }

  onQuantitaChange() {
    this.calcolaConversione();
  }

  onValutaTargetChange() {
    this.calcolaConversione();
  }

  aggiornaPrezzo() {
    if (this.daCripto) {
      this.prezzoAttuale = this.prezziCripto[this.daCripto];
    }
  }

  calcolaConversione() {
    if (this.quantita && this.quantita > 0) {
      // Converti in EUR
      const valoreInEur = this.quantita * this.prezziCripto[this.daCripto];

      // Converti nella valuta target
      if (this.aValuta in this.tassiFiat) {
        // Conversione a fiat
        this.totaleFiat = valoreInEur * this.tassiFiat[this.aValuta];
        // Equivalente in ETH come riferimento
        this.equivalenteAltraCripto = valoreInEur / this.prezziCripto['ETH'];
      } else {
        // Conversione a cripto
        this.totaleFiat = valoreInEur * this.tassiFiat['EUR']; // Mostra sempre in EUR
        this.equivalenteAltraCripto = valoreInEur / this.prezziCripto[this.aValuta];
      }
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
