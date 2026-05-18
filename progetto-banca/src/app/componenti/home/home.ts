import { Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankingService } from '../../banking.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly banking = inject(BankingService);
  private readonly authService = inject(AuthService);

  displayName = 'Cliente';

  readonly transazioniList = toSignal(this.banking.transazioni$, { initialValue: [] });
  readonly transazioniLoading = toSignal(this.banking.transazioniLoading$, { initialValue: false });
  readonly saldoConto = toSignal(this.banking.saldo$, { initialValue: 0 });

  readonly transazioniRecenti = computed(() => this.transazioniList().slice(0, 8));

  ngOnInit(): void {
    const session = this.authService.getSession();
    this.displayName = session?.displayName ?? 'Cliente';
    this.banking.refreshTransazioni().subscribe();
  }

  cardLastFour(): string {
    const accountId = this.authService.getSession()?.accountId ?? 0;
    return String(1000 + (accountId % 9000));
  }
}
