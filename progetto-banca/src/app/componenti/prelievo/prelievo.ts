import { Component } from '@angular/core';
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
  iban: string = '';
  causale: string = '';

  constructor(private bankingService: BankingService) {}

  onSubmit() {
    if (this.importo > 0 && this.iban && this.causale) {
      const success = this.bankingService.prelievo(this.importo, this.causale);
      if (success) {
        alert(`Prelievo di €${this.importo.toFixed(2)} effettuato con successo!`);
        this.importo = 0;
        this.iban = '';
        this.causale = '';
      } else {
        alert('Errore: importo non valido o saldo insufficiente.');
      }
    } else {
      alert('Compila tutti i campi correttamente.');
    }
  }
}
