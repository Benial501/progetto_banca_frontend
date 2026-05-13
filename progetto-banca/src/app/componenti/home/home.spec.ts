import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Home } from './home';
import { BankingService } from '../../banking.service';
import { AuthService } from '../../auth.service';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: BankingService,
          useValue: {
            refreshTransazioni: () => of([]),
            transazioni: () => [],
            saldo: () => 100,
            transazioniLoading: () => false,
          },
        },
        {
          provide: AuthService,
          useValue: {
            getSession: () => ({ email: 'test@example.com', displayName: 'Mario Rossi' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
