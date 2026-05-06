import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvCripto } from './conv-cripto';

describe('ConvCripto', () => {
  let component: ConvCripto;
  let fixture: ComponentFixture<ConvCripto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvCripto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvCripto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
