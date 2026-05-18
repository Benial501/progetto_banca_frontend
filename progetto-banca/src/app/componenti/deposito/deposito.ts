import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-deposito',
  imports: [FormsModule, CommonModule],
  templateUrl: './deposito.html',
  styleUrl: './deposito.css',
})
export class Deposito {
  importo: number = 0;
  metodo: string = 'carta';

  readonly feedback = signal<string>('');

  private readonly bankingService = inject(BankingService);
  private readonly router = inject(Router);

  onSubmit(): void {
    this.feedback.set('');

    if (this.importo <= 0) {
      this.feedback.set('Inserisci un importo valido.');
      return;
    }

    this.bankingService
      .deposito(this.importo, `Deposito via ${this.metodo}`)
      .pipe(take(1))
      .subscribe((ok) => {
        if (ok) {
          void this.router.navigate(['/success'], { queryParams: { kind: 'deposito' } });
        } else {
          this.feedback.set('Deposito non riuscito. Verifica l’importo e riprova.');
        }
      });
  }
}
