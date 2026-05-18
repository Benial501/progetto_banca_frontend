import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
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
            transazioni$: new BehaviorSubject([]).asObservable(),
            saldo$: new BehaviorSubject(100).asObservable(),
            transazioniLoading$: new BehaviorSubject(false).asObservable(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getSession: () => ({ accountId: 1, displayName: 'Mario Rossi' }),
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
