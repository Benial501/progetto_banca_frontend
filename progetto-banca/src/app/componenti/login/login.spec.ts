import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';
import { AuthService } from '../../auth.service';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
