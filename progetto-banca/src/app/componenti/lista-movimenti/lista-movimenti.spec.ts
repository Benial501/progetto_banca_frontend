import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ListaMovimenti } from './lista-movimenti';
import { BankingService } from '../../banking.service';

describe('ListaMovimenti', () => {
  let fixture: ComponentFixture<ListaMovimenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMovimenti],
      providers: [
        provideRouter([]),
        {
          provide: BankingService,
          useValue: {
            transazioni: () => [],
            transazioniLoading: () => false,
            refreshTransazioni: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMovimenti);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
