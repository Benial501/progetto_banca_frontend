import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saldo.html',
  styleUrl: './saldo.css',
})
export class Saldo implements OnInit {
  readonly banking = inject(BankingService);

  ngOnInit(): void {
    this.banking.refreshTransazioni().subscribe();
  }
}
