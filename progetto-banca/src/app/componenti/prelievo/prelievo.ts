import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-prelievo',
  imports: [FormsModule],
  templateUrl: './prelievo.html',
  styleUrl: './prelievo.css',
})
export class Prelievo {
  importo: number = 0;
  causale: string = '';

  private bankingService = inject(BankingService);

  onSubmit(): void {
    if (this.importo > 0 && this.causale.trim()) {
      this.bankingService.prelievo(this.importo, this.causale.trim()).subscribe((success) => {
        if (success) {
          alert(`Prelievo di €${this.importo.toFixed(2)} effettuato con successo!`);
          this.importo = 0;
          this.causale = '';
        } else {
          alert('Errore: importo non valido o saldo insufficiente.');
        }
      });
    } else {
      alert('Inserisci importo e causale.');
    }
  }
}
