import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-lista-movimenti',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-movimenti.html',
  styleUrl: './lista-movimenti.css',
})
export class ListaMovimenti implements OnInit {
  readonly banking = inject(BankingService);

  readonly transazioniList = toSignal(this.banking.transazioni$, { initialValue: [] });
  readonly transazioniLoading = toSignal(this.banking.transazioniLoading$, { initialValue: false });

  readonly periodo = signal<string>('mese');
  readonly tipo = signal<string>('tutti');

  readonly periodoOptions = [
    { value: 'oggi', label: 'Oggi' },
    { value: 'settimana', label: 'Settimana' },
    { value: 'mese', label: 'Mese' },
    { value: 'anno', label: 'Anno' },
  ] as const;

  readonly tipoOptions = [
    { value: 'tutti', label: 'Tutti' },
    { value: 'entrata', label: 'Entrate' },
    { value: 'uscita', label: 'Uscite' },
  ] as const;

  readonly transazioniFiltrate = computed(() => {
    const list = this.transazioniList();
    return list.filter((transazione) => {
      const matchTipo =
        this.tipo() === 'tutti' ||
        (this.tipo() === 'entrata' && transazione.importo > 0) ||
        (this.tipo() === 'uscita' && transazione.importo < 0);

      return matchTipo && this.isNelPeriodo(transazione.data);
    });
  });

  ngOnInit(): void {
    this.banking.refreshTransazioni().subscribe();
  }

  setPeriodo(value: string): void {
    this.periodo.set(value);
  }

  setTipo(value: string): void {
    this.tipo.set(value);
  }

  private isNelPeriodo(dataTransazione: Date): boolean {
    const adesso = new Date();
    const data = new Date(dataTransazione);

    switch (this.periodo()) {
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
