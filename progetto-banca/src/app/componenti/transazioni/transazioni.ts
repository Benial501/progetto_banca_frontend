import { Component, OnInit, inject } from '@angular/core';
import { switchMap } from 'rxjs';
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

  private route = inject(ActivatedRoute);
  private bankingService = inject(BankingService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) {
      this.loading = false;
      return;
    }

    this.bankingService
      .refreshTransazioni()
      .pipe(switchMap(() => this.bankingService.getTransazioneById(id)))
      .subscribe((transazione) => {
        this.transazione = transazione;
        this.loading = false;
      });
  }
}
