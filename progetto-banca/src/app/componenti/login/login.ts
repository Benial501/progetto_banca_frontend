import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
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

  email = '';
  password = '';
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
    const res = this.auth.login(this.email, this.password);
    if (res.ok) {
      void this.router.navigateByUrl('/');
    } else {
      this.error = res.message;
    }
  }
}
