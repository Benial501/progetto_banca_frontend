import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, map, of, switchMap } from 'rxjs';
import { AuthService, REGISTRATION_CURRENCIES } from '../../auth.service';
import { BankingService } from '../../banking.service';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-registrazione',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registrazione.html',
  styleUrl: './registrazione.css',
})
export class Registrazione implements OnInit {
  readonly theme = inject(ThemeService);

  /** Valute disponibili per il nuovo conto (stesso elenco del backend atteso). */
  readonly valute = [...REGISTRATION_CURRENCIES];

  displayName = '';
  valuta = 'EUR';
  error = '';
  loading = false;

  private auth = inject(AuthService);
  private banking = inject(BankingService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigateByUrl('/');
    }
  }

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    this.auth
      .register(this.displayName, this.valuta)
      .pipe(
        switchMap((res) => {
          if (!res.ok) {
            return of(res);
          }
          return this.banking.refreshTransazioni().pipe(map(() => res));
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((res) => {
        if (res.ok) {
          void this.router.navigateByUrl('/');
        } else {
          this.error = res.message;
        }
      });
  }
}
