import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  readonly saldoConto = toSignal(this.bankingService.saldo$, { initialValue: 0 });

  readonly aValuta = signal<string>('USD');

  readonly saldoConvertito = computed(() =>
    this.bankingService.getSaldoConvertito(this.saldoConto(), this.aValuta())
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
