import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
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

  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigateByUrl('/');
    }
  }

  onSubmit(): void {
    this.error = '';
    if (this.password !== this.confirmPassword) {
      this.error = 'Le password non coincidono.';
      return;
    }
    const res = this.auth.register(this.email, this.password, this.displayName);
    if (res.ok) {
      void this.router.navigateByUrl('/');
    } else {
      this.error = res.message;
    }
  }
}
