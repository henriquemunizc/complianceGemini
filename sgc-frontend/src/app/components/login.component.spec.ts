import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { LoginResponse, PerfilUsuario } from '../models/auth.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let routerMock: jest.Mocked<Router>;

  const mockLoginResponse: LoginResponse = {
    token: 'mock-token-123',
    tipo: 'Bearer',
    email: 'admin@sgc.com',
    nome: 'Admin User',
    perfil: PerfilUsuario.ROLE_ADMIN
  };

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form rendering', () => {
    it('should render login form with email and password fields', () => {
      // Arrange
      const compiled = fixture.nativeElement;

      // Assert
      expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
      expect(compiled.querySelector('p-password')).toBeTruthy();
      expect(compiled.querySelector('p-button[type="submit"]')).toBeTruthy();
    });

    it('should initialize with empty credentials', () => {
      // Assert
      expect(component.credentials.email).toBe('');
      expect(component.credentials.senha).toBe('');
    });

    it('should initialize with loading false and no error message', () => {
      // Assert
      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Form validation', () => {
    it('should have required attribute on email input', () => {
      // Arrange
      const compiled = fixture.nativeElement;
      const emailInput = compiled.querySelector('input[type="email"]');

      // Assert
      expect(emailInput.hasAttribute('required')).toBe(true);
    });

    it('should have required attribute on password input', () => {
      // Arrange
      const compiled = fixture.nativeElement;
      const passwordInput = compiled.querySelector('p-password');

      // Assert
      expect(passwordInput.hasAttribute('required')).toBe(true);
    });

    it('should bind email input to credentials.email', () => {
      // Arrange
      const compiled = fixture.nativeElement;
      const emailInput = compiled.querySelector('input[type="email"]') as HTMLInputElement;

      // Act
      component.credentials.email = 'test@example.com';
      fixture.detectChanges();

      // Assert
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('onSubmit - Success', () => {
    it('should call authService.login on form submit', () => {
      // Arrange
      const loginSpy = jest.spyOn(authService, 'login').mockReturnValue(of(mockLoginResponse));
      component.credentials = {
        email: 'admin@sgc.com',
        senha: 'senha123'
      };

      // Act
      component.onSubmit();

      // Assert
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'admin@sgc.com',
        senha: 'senha123'
      });
    });

    it('should set loading to true during login', () => {
      // Arrange
      jest.spyOn(authService, 'login').mockReturnValue(of(mockLoginResponse));
      component.credentials = {
        email: 'admin@sgc.com',
        senha: 'senha123'
      };

      // Act
      component.onSubmit();

      // Assert (loading is set to true immediately)
      expect(component.loading).toBe(true);
    });

    it('should navigate to /obrigacoes on successful login', (done) => {
      // Arrange
      jest.spyOn(authService, 'login').mockReturnValue(of(mockLoginResponse));
      component.credentials = {
        email: 'admin@sgc.com',
        senha: 'senha123'
      };

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['/obrigacoes']);
        done();
      }, 100);
    });

    it('should set loading to false after successful login', (done) => {
      // Arrange
      jest.spyOn(authService, 'login').mockReturnValue(of(mockLoginResponse));
      component.credentials = {
        email: 'admin@sgc.com',
        senha: 'senha123'
      };

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should clear error message on successful login', (done) => {
      // Arrange
      jest.spyOn(authService, 'login').mockReturnValue(of(mockLoginResponse));
      component.credentials = {
        email: 'admin@sgc.com',
        senha: 'senha123'
      };
      component.errorMessage = 'Previous error';

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.errorMessage).toBe('');
        done();
      }, 100);
    });
  });

  describe('onSubmit - Error', () => {
    it('should display error message on login failure', (done) => {
      // Arrange
      const errorResponse = {
        error: { message: 'Credenciais inválidas' }
      };
      jest.spyOn(authService, 'login').mockReturnValue(throwError(() => errorResponse));
      component.credentials = {
        email: 'wrong@email.com',
        senha: 'wrongpass'
      };

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.errorMessage).toBe('Credenciais inválidas');
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should display default error message when error.message is not available', (done) => {
      // Arrange
      const errorResponse = { error: {} };
      jest.spyOn(authService, 'login').mockReturnValue(throwError(() => errorResponse));
      component.credentials = {
        email: 'wrong@email.com',
        senha: 'wrongpass'
      };

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.errorMessage).toBe('Erro ao fazer login. Verifique suas credenciais.');
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should set loading to false on login error', (done) => {
      // Arrange
      const errorResponse = {
        error: { message: 'Erro de rede' }
      };
      jest.spyOn(authService, 'login').mockReturnValue(throwError(() => errorResponse));
      component.credentials = {
        email: 'test@example.com',
        senha: 'password'
      };

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should not navigate on login error', (done) => {
      // Arrange
      const errorResponse = {
        error: { message: 'Credenciais inválidas' }
      };
      jest.spyOn(authService, 'login').mockReturnValue(throwError(() => errorResponse));
      component.credentials = {
        email: 'wrong@email.com',
        senha: 'wrongpass'
      };

      // Act
      component.onSubmit();

      // Assert
      setTimeout(() => {
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Loading state', () => {
    it('should show loading button when loading is true', () => {
      // Arrange
      component.loading = true;
      fixture.detectChanges();

      // Act
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('p-button[type="submit"]');

      // Assert
      expect(button.hasAttribute('loading')).toBe(true);
    });

    it('should not disable form during loading', () => {
      // Arrange
      component.loading = true;
      fixture.detectChanges();

      // Act
      const compiled = fixture.nativeElement;
      const emailInput = compiled.querySelector('input[type="email"]') as HTMLInputElement;

      // Assert
      // PrimeNG button with loading state doesn't disable inputs
      expect(emailInput.disabled).toBe(false);
    });
  });

  describe('Error message display', () => {
    it('should show error message when errorMessage is set', () => {
      // Arrange
      component.errorMessage = 'Erro de teste';
      fixture.detectChanges();

      // Act
      const compiled = fixture.nativeElement;
      const errorMessage = compiled.querySelector('p-message');

      // Assert
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.getAttribute('text')).toBe('Erro de teste');
    });

    it('should not show error message when errorMessage is empty', () => {
      // Arrange
      component.errorMessage = '';
      fixture.detectChanges();

      // Act
      const compiled = fixture.nativeElement;
      const errorMessage = compiled.querySelector('p-message');

      // Assert
      expect(errorMessage).toBeFalsy();
    });
  });
});
