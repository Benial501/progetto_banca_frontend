import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-deposito',
  imports: [FormsModule],
  templateUrl: './deposito.html',
  styleUrl: './deposito.css',
})
export class Deposito {
  importo: number = 0;
  metodo: string = 'carta';

  constructor(private bankingService: BankingService) {}

  onSubmit() {
    if (this.importo > 0) {
      this.bankingService
        .deposito(this.importo, `Deposito via ${this.metodo}`)
        .subscribe((success) => {
          if (success) {
            alert(`Deposito di €${this.importo.toFixed(2)} effettuato con successo!`);
            this.importo = 0;
          } else {
            alert('Errore: importo non valido.');
          }
        });
    } else {
      alert('Inserisci un importo valido.');
    }
  }
}
