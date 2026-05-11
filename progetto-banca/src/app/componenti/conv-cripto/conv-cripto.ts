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
  aValuta: string = 'BTC';

  saldoConvertito: number = 0;
  saldoAttuale: number = 0;

  tassiFiat: { [key: string]: number } = {};

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.tassiFiat = this.bankingService.tassiFiat;
    this.bankingService.getSaldo().subscribe((saldo) => {
      this.saldoAttuale = saldo;
      this.aggiornaSaldoConvertito();
    });
  }

  onValutaTargetChange() {
    this.aggiornaSaldoConvertito();
  }

  aggiornaSaldoConvertito() {
    if (this.aValuta in this.bankingService.tassiFiat) {
      this.saldoConvertito = this.bankingService.getSaldoConvertito(
        this.saldoAttuale,
        this.aValuta
      );
    } else {
      this.saldoConvertito = this.bankingService.getSaldoCriptoConvertito(
        this.saldoAttuale,
        this.aValuta
      );
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
}

