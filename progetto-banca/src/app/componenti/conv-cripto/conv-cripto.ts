import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  readonly bankingService = inject(BankingService);

  readonly aValuta = signal<string>('BTC');

  readonly isFiatTarget = computed(() => this.aValuta() in this.bankingService.tassiFiat);

  readonly saldoConvertito = computed(() => {
    const saldo = this.bankingService.saldo();
    const v = this.aValuta();
    if (v in this.bankingService.tassiFiat) {
      return this.bankingService.getSaldoConvertito(saldo, v);
    }
    return this.bankingService.getSaldoCriptoConvertito(saldo, v);
  });

  ngOnInit(): void {
    this.bankingService.refreshTransazioni().subscribe();
  }

  formattaNumero(num: number, decimali: number = 2): string {
    return num.toFixed(decimali);
  }

  getSimboloValuta(valuta: string): string {
    return this.bankingService.getSimboloValuta(valuta);
  }
}
