import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BankingService, Transazione } from '../../banking.service';

@Component({
  selector: 'app-lista-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-movimenti.html',
  styleUrl: './lista-movimenti.css',
})
export class ListaMovimenti implements OnInit {
  transazioni: Transazione[] = [];
  periodo: string = 'mese';
  tipo: string = 'tutti';

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.caricaTransazioni();
  }

  caricaTransazioni() {
    this.bankingService.getTransazioni().subscribe((transazioni) => {
      this.transazioni = transazioni;
    });
  }

  onFiltroChange() {
    // Manteniamo il metodo per il binding del template:
    // i dati mostrati vengono filtrati dal getter transazioniFiltrate.
  }

  get transazioniFiltrate(): Transazione[] {
    return this.transazioni.filter((transazione) => {
      const matchTipo =
        this.tipo === 'tutti' ||
        (this.tipo === 'entrata' && transazione.importo > 0) ||
        (this.tipo === 'uscita' && transazione.importo < 0);

      return matchTipo && this.isNelPeriodo(transazione.data);
    });
  }

  private isNelPeriodo(dataTransazione: Date): boolean {
    const adesso = new Date();
    const data = new Date(dataTransazione);

    switch (this.periodo) {
      case 'oggi':
        return data.toDateString() === adesso.toDateString();
      case 'settimana': {
        const inizioSettimana = new Date(adesso);
        inizioSettimana.setDate(adesso.getDate() - 7);
        return data >= inizioSettimana && data <= adesso;
      }
      case 'mese':
        return (
          data.getMonth() === adesso.getMonth() &&
          data.getFullYear() === adesso.getFullYear()
        );
      case 'anno':
        return data.getFullYear() === adesso.getFullYear();
      default:
        return true;
    }
  }
}