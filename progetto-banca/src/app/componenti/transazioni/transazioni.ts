import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BankingService, Transazione } from '../../banking.service';

@Component({
  selector: 'app-transazioni',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transazioni.html',
  styleUrl: './transazioni.css',
})
export class Transazioni implements OnInit {
  transazione?: Transazione;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private bankingService: BankingService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(id)) {
      this.bankingService.getTransazioneById(id).subscribe((transazione) => {
        this.transazione = transazione;
        this.loading = false;
      });
      return;
    }
    this.loading = false;
  }
}