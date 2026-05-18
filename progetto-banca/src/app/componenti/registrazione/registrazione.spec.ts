import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Registrazione } from './registrazione';
import { AuthService } from '../../auth.service';
import { BankingService } from '../../banking.service';

describe('Registrazione', () => {
  let fixture: ComponentFixture<Registrazione>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Registrazione],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        {
          provide: BankingService,
          useValue: {
            refreshTransazioni: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Registrazione);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
