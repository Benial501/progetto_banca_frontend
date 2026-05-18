import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const MESSAGES: Readonly<Record<string, string>> = {
  prelievo: 'Il prelievo è stato registrato correttamente.',
  deposito: 'Il versamento è stato registrato correttamente.'
};

@Component({
  selector: 'app-success-page',
  standalone: true,
  templateUrl: './success-page.html',
  styleUrl: './success-page.css',
})
export class SuccessPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly message = computed(() => {
    const kind = this.route.snapshot.queryParamMap.get('kind') ?? 'deposito';
    return MESSAGES[kind] ?? MESSAGES['deposito'];
  });

  goHome(): void {
    void this.router.navigate(['/home']);
  }
}
