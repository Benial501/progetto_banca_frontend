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
  aValuta: string = 'USD';

  saldoConvertito: number = 0;
  saldoAttuale: number = 0;

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.bankingService.getSaldo().subscribe((saldo) => {
      this.saldoAttuale = saldo;
      this.aggiornaSaldoConvertito();
    });
  }

  onValutaChange() {
    this.aggiornaSaldoConvertito();
  }

  aggiornaSaldoConvertito() {
    this.saldoConvertito = this.bankingService.getSaldoConvertito(
      this.saldoAttuale,
      this.aValuta
    );
  }

  formattaNumero(num: number, decimali: number = 2): string {
    return num.toFixed(decimali);
  }

  getSimboloValuta(valuta: string): string {
    return this.bankingService.getSimboloValuta(valuta);
  }
}