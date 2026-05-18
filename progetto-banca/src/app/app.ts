import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { filter } from 'rxjs';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { ThemeService } from './theme.service';
import { AuthService } from './auth.service';
import { BankingService } from './banking.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  menuOpen = false;
  readonly theme = inject(ThemeService);

  private readonly currentPath = signal('');
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly banking = inject(BankingService);

  readonly showAppChrome = computed(() => {
    const p = this.currentPath();
    return (
      p !== '/login' &&
      p !== '/registrazione' &&
      p !== '/error' &&
      p !== '/success'
    );
  });

  ngOnInit(): void {
    this.currentPath.set(this.router.url.split('?')[0]);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const path = e.urlAfterRedirects.split('?')[0];
        this.currentPath.set(path);
        this.refreshBankingDataIfNeeded(path);
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.auth.logout();
    this.banking.resetState();
    this.closeMenu();
    void this.router.navigateByUrl('/login');
  }

  private refreshBankingDataIfNeeded(path: string): void {
    if (!this.auth.isLoggedIn()) {
      return;
    }
    const shouldRefresh =
      path === '/' ||
      path === '/lista-movimenti' ||
      path === '/saldo' ||
      path === '/prelievo' ||
      path === '/deposito' ||
      path === '/success' ||
      path.startsWith('/transazioni/');
    if (shouldRefresh) {
      this.banking.refreshTransazioni().subscribe();
    }
  }
}
