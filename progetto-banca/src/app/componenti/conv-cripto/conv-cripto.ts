import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../banking.service';

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

  saldoConvertito: number = 0;

  tassiFiat: { [key: string]: number } = {};

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.tassiFiat = this.bankingService.tassiFiat;
    this.calcolaConversione();
    this.aggiornaSaldoConvertito();
  }

  onCriptoChange() {
    this.aggiornaPrezzo();
    this.calcolaConversione();
    this.aggiornaSaldoConvertito();
  }

  onQuantitaChange() {
    this.calcolaConversione();
  }

  onValutaTargetChange() {
    this.calcolaConversione();
    this.aggiornaSaldoConvertito();
  }

  aggiornaPrezzo() {
    if (this.daCripto) {
      this.prezzoAttuale = this.bankingService.prezziCripto[this.daCripto];
    }
  }

  calcolaConversione() {
    if (this.quantita && this.quantita > 0) {
      // Converti in EUR
      const valoreInEur = this.quantita * this.bankingService.prezziCripto[this.daCripto];

      // Converti nella valuta target
      if (this.aValuta in this.bankingService.tassiFiat) {
        // Conversione a fiat
        this.totaleFiat = valoreInEur * this.bankingService.tassiFiat[this.aValuta];
        // Equivalente in ETH come riferimento
        this.equivalenteAltraCripto = valoreInEur / this.bankingService.prezziCripto['ETH'];
      } else {
        // Conversione a cripto
        this.totaleFiat = valoreInEur * this.bankingService.tassiFiat['EUR']; // Mostra sempre in EUR
        this.equivalenteAltraCripto = valoreInEur / this.bankingService.prezziCripto[this.aValuta];
      }
    }
  }

  aggiornaSaldoConvertito() {
    if (this.aValuta in this.bankingService.tassiFiat) {
      this.saldoConvertito = this.bankingService.getSaldoConvertito(this.aValuta);
    } else {
      this.saldoConvertito = this.bankingService.getSaldoCriptoConvertito(this.aValuta);
    }
  }

  formattaNumero(num: number, decimali: number = 2): string {
    return num.toFixed(decimali);
  }

  getSimboloValuta(valuta: string): string {
    return this.bankingService.getSimboloValuta(valuta);
  }

  getNomeCripto(crypto: string): string {
    return this.bankingService.getNomeCripto(crypto);
  }

  onConverti() {
    alert('Funzionalità conversione cripto non implementata.');
  }
}

