import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const MESSAGES: Readonly<Record<string, string>> = {
  insufficient_balance: 'Saldo insufficiente per completare il prelievo',
  unknown: 'Si è verificato un errore. Riprova più tardi.',
  account_not_found: 'Conto non trovato. Verifica il numero inserito.',
  login_timeout: 'Il server non ha risposto in tempo. Riprova tra poco.',
  network_error: 'Connessione non riuscita. Controlla la rete e riprova.',
  invalid_id: 'Il numero conto non è valido.'
};

@Component({
  selector: 'app-error-page',
  standalone: true,
  templateUrl: './error-page.html',
  styleUrl: './error-page.css',
})
export class ErrorPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly message = computed(() => {
    const code = this.route.snapshot.queryParamMap.get('code') ?? 'unknown';
    return MESSAGES[code] ?? MESSAGES['unknown'];
  });

  /** Flusso login / accesso: pulsante riporta al login invece che alla home protetta. */
  readonly isAuthContext = computed(
    () => this.route.snapshot.queryParamMap.get('context') === 'auth'
  );

  goHome(): void {
    void this.router.navigate(['/home']);
  }

  goLogin(): void {
    void this.router.navigate(['/login']);
  }
}
