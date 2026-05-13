import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly isDark = signal(false);

  constructor() {
    const saved = localStorage.getItem(THEME_KEY);
    this.isDark.set(saved === 'dark');
    this.applyToDocument();
  }

  toggle(): void {
    this.isDark.update((v) => !v);
    localStorage.setItem(THEME_KEY, this.isDark() ? 'dark' : 'light');
    this.applyToDocument();
  }

  private applyToDocument(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isDark() ? 'dark' : 'light'
    );
  }
}
