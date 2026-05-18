import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../auth.service';
import { BankingService } from '../../banking.service';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  readonly theme = inject(ThemeService);

  accountNumber = '';
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
      .login(this.accountNumber)
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
          return;
        }

        if (res.code === 'invalid_id') {
          this.error = 'Inserisci un numero conto valido.';
          return;
        }

        void this.router.navigate(['/error'], {
          queryParams: { code: res.code, context: 'auth' }
        });
      });
  }
}
