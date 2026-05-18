import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-prelievo',
  imports: [CommonModule, FormsModule],
  templateUrl: './prelievo.html',
  styleUrl: './prelievo.css',
})
export class Prelievo implements OnInit {
  importo: number = 0;
  causale: string = '';

  readonly feedback = signal<string>('');

  private readonly bankingService = inject(BankingService);
  private readonly router = inject(Router);

  readonly saldoConto = toSignal(this.bankingService.saldo$, { initialValue: 0 });

  ngOnInit(): void {
    this.bankingService.refreshTransazioni().subscribe();
  }

  onSubmit(): void {
    this.feedback.set('');

    if (this.importo <= 0 || !this.causale.trim()) {
      this.feedback.set('Inserisci importo e causale validi.');
      return;
    }

    this.bankingService
      .prelievo(this.importo, this.causale.trim())
      .pipe(take(1))
      .subscribe((result) => {
        if (result.success) {
          void this.router.navigate(['/success'], { queryParams: { kind: 'prelievo' } });
          return;
        }

        if (result.reason === 'insufficient_balance') {
          void this.router.navigate(['/error'], { queryParams: { code: 'insufficient_balance' } });
          return;
        }

        if (result.reason === 'no_account') {
          void this.router.navigate(['/login']);
          return;
        }

        if (result.reason === 'invalid_amount') {
          this.feedback.set('Inserisci un importo valido.');
          return;
        }

        void this.router.navigate(['/error'], { queryParams: { code: 'unknown' } });
      });
  }
}
