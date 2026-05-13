import { Component, OnInit, computed, inject } from '@angular/core';
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

  readonly transazioniRecenti = computed(() => this.banking.transazioni().slice(0, 8));

  ngOnInit(): void {
    const session = this.authService.getSession();
    this.displayName = session?.displayName ?? 'Cliente';
    this.banking.refreshTransazioni().subscribe();
  }

  cardLastFour(): string {
    const email = this.authService.getSession()?.email ?? 'user';
    let h = 0;
    for (let i = 0; i < email.length; i++) {
      h = (h * 31 + email.charCodeAt(i)) >>> 0;
    }
    return String(1000 + (h % 9000));
  }
}
