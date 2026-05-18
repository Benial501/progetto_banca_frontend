import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
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
  /** Signal: aggiornamento vista garantito senza dipendere da click esterni (es. tema). */
  readonly loading = signal(true);
  readonly transazione = signal<Transazione | undefined>(undefined);

  private readonly route = inject(ActivatedRoute);
  private readonly bankingService = inject(BankingService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        distinctUntilChanged(),
        tap((id) => {
          if (Number.isNaN(id)) {
            this.loading.set(false);
            this.transazione.set(undefined);
            return;
          }
          this.loading.set(true);
          this.transazione.set(undefined);
        }),
        filter((id) => !Number.isNaN(id)),
        switchMap((id) =>
          this.bankingService
            .refreshTransazioni()
            .pipe(switchMap(() => this.bankingService.getTransazioneById(id, true)))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((tx) => {
        this.transazione.set(tx);
        this.loading.set(false);
      });
  }
}
