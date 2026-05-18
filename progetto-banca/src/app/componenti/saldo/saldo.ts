import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saldo.html',
  styleUrl: './saldo.css',
})
export class Saldo implements OnInit {
  readonly banking = inject(BankingService);

  readonly transazioniLoading = toSignal(this.banking.transazioniLoading$, { initialValue: false });
  readonly saldoConto = toSignal(this.banking.saldo$, { initialValue: 0 });

  ngOnInit(): void {
    this.banking.refreshTransazioni().subscribe();
  }
}
