import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvFiat } from './conv-fiat';

describe('ConvFiat', () => {
  let component: ConvFiat;
  let fixture: ComponentFixture<ConvFiat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvFiat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvFiat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
