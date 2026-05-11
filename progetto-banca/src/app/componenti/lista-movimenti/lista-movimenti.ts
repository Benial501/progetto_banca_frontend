import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // ✅ AGGIUNTO
import { BankingService, Transazione } from '../../banking.service';

@Component({
  selector: 'app-lista-movimenti',
  standalone: true,                             // ✅ AGGIUNTO
  imports: [CommonModule, FormsModule],         // ✅ AGGIUNTO FormsModule
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
    this.transazioni = this.bankingService.getTransazioni();
  }

  onFiltroChange() {
    this.caricaTransazioni();
  }
}