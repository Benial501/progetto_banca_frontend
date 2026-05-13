import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Registrazione } from './registrazione';
import { AuthService } from '../../auth.service';

describe('Registrazione', () => {
  let fixture: ComponentFixture<Registrazione>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Registrazione],
      providers: [provideRouter([]), AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(Registrazione);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
