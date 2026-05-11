import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // ✅ IMPORTANTE
import { BankingService } from '../../banking.service';

@Component({
  selector: 'app-saldo',
  standalone: true,                 // ✅ DEVE ESSERCI
  imports: [CommonModule],          // ✅ DEVE ESSERCI
  templateUrl: './saldo.html',
  styleUrl: './saldo.css',
})
export class Saldo implements OnInit {

  saldo: number = 0;

  constructor(private bankingService: BankingService) {}

  ngOnInit() {
    this.saldo = this.bankingService.getSaldo();
  }

  onAggiorna() {
    this.saldo = this.bankingService.getSaldo();
  }

  onEstrattoConto() {
    alert('Funzionalità non ancora implementata.');
  }
}