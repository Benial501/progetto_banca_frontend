import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-conv-fiat',
  standalone: true,
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

  saldoConvertito: number = 0;

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.calcolaConversione();
    this.aggiornaSaldoConvertito();
  }

  onValutaChange() {
    this.aggiornaTasso();
    this.calcolaConversione();
    this.aggiornaSaldoConvertito();
  }

  onImportoChange() {
    this.calcolaConversione();
  }

  aggiornaTasso() {
    if (this.daValuta && this.aValuta) {
      const tassoDa = this.bankingService.tassiFiat[this.daValuta] ?? 1;
      const tassoA = this.bankingService.tassiFiat[this.aValuta] ?? 1;
      this.tassoDiCambio = tassoA / tassoDa;
    }
  }

  calcolaConversione() {
    if (this.importo && this.importo > 0) {
      const tassoDa = this.bankingService.tassiFiat[this.daValuta] ?? 1;
      const tassoA = this.bankingService.tassiFiat[this.aValuta] ?? 1;
      const prezzoBTC = this.bankingService.prezziCripto['BTC'] ?? 1;

      const importoInEur = this.importo / tassoDa;
      this.totaleFiat = importoInEur * tassoA;
      this.equivalenteCripto = importoInEur / prezzoBTC;
    }
  }

  aggiornaSaldoConvertito() {
    this.saldoConvertito =
      this.bankingService.getSaldoConvertito(this.aValuta);
  }

  formattaNumero(num: number, decimali: number = 2): string {
    return num.toFixed(decimali);
  }

  getSimboloValuta(valuta: string): string {
    return this.bankingService.getSimboloValuta(valuta);
  }

  onConverti() {
    alert('Funzionalità conversione non implementata.');
  }
}