import { Component, OnInit } from '@angular/core';
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
  saldo: number = 0;

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.bankingService.getSaldo().subscribe((saldo) => {
      this.saldo = saldo;
    });
  }
}