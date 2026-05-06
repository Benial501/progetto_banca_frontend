import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMovimenti } from './lista-movimenti';

describe('ListaMovimenti', () => {
  let component: ListaMovimenti;
  let fixture: ComponentFixture<ListaMovimenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMovimenti]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaMovimenti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
