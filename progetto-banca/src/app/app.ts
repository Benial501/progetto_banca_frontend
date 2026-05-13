import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { filter } from 'rxjs';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { ThemeService } from './theme.service';
import { AuthService } from './auth.service';

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

  readonly showAppChrome = computed(() => {
    const p = this.currentPath();
    return p !== '/login' && p !== '/registrazione';
  });

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentPath.set(this.router.url.split('?')[0]);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentPath.set(e.urlAfterRedirects.split('?')[0]));
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
    this.closeMenu();
    void this.router.navigateByUrl('/login');
  }
}
