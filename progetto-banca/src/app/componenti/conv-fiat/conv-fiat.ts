import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  readonly bankingService = inject(BankingService);

  readonly aValuta = signal<string>('USD');

  readonly saldoConvertito = computed(() =>
    this.bankingService.getSaldoConvertito(this.bankingService.saldo(), this.aValuta())
  );

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
