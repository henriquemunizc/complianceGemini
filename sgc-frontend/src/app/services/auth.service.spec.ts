import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, PerfilUsuario } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: jest.Mocked<Router>;

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token-123',
    tipo: 'Bearer',
    email: 'admin@sgc.com',
    nome: 'Admin User',
    perfil: PerfilUsuario.ROLE_ADMIN
  };

  beforeEach(() => {
    // Mock Router
    routerMock = {
      navigate: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store session', (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'admin@sgc.com',
        senha: 'senha123'
      };

      // Act
      service.login(credentials).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockLoginResponse);
          expect(localStorage.getItem('sgc_token')).toBe(mockLoginResponse.token);
          expect(localStorage.getItem('sgc_user')).toBe(JSON.stringify(mockLoginResponse));
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);

      req.flush(mockLoginResponse);
    });

    it('should update currentUser$ BehaviorSubject on login', (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'admin@sgc.com',
        senha: 'senha123'
      };

      // Act
      service.login(credentials).subscribe(() => {
        service.currentUser$.subscribe(user => {
          // Assert
          expect(user).toEqual(mockLoginResponse);
          done();
        });
      });

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockLoginResponse);
    });

    it('should handle login error', (done) => {
      // Arrange
      const credentials: LoginRequest = {
        email: 'wrong@email.com',
        senha: 'wrongpass'
      };
      const errorResponse = { message: 'Credenciais inválidas' };

      // Act
      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          // Assert
          expect(error.error).toEqual(errorResponse);
          expect(localStorage.getItem('sgc_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear session and navigate to login', () => {
      // Arrange
      localStorage.setItem('sgc_token', 'some-token');
      localStorage.setItem('sgc_user', JSON.stringify(mockLoginResponse));

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('sgc_token')).toBeNull();
      expect(localStorage.getItem('sgc_user')).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should update currentUser$ to null on logout', (done) => {
      // Arrange
      localStorage.setItem('sgc_token', 'some-token');
      localStorage.setItem('sgc_user', JSON.stringify(mockLoginResponse));

      // Act
      service.logout();

      // Assert
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      // Arrange
      const token = 'mock-token-abc';
      localStorage.setItem('sgc_token', token);

      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBe(token);
    });

    it('should return null if no token exists', () => {
      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      // Arrange
      localStorage.setItem('sgc_token', 'some-token');

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if no token exists', () => {
      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has the specified role', (done) => {
      // Arrange
      const credentials: LoginRequest = { email: 'admin@sgc.com', senha: 'senha123' };

      service.login(credentials).subscribe(() => {
        // Act
        const result = service.hasRole(PerfilUsuario.ROLE_ADMIN);

        // Assert
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockLoginResponse);
    });

    it('should return false if user does not have the specified role', (done) => {
      // Arrange
      const credentials: LoginRequest = { email: 'admin@sgc.com', senha: 'senha123' };

      service.login(credentials).subscribe(() => {
        // Act
        const result = service.hasRole(PerfilUsuario.ROLE_VISUALIZADOR);

        // Assert
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockLoginResponse);
    });

    it('should return false if no user is logged in', () => {
      // Act
      const result = service.hasRole(PerfilUsuario.ROLE_ADMIN);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has any of the specified roles', (done) => {
      // Arrange
      const credentials: LoginRequest = { email: 'admin@sgc.com', senha: 'senha123' };

      service.login(credentials).subscribe(() => {
        // Act
        const result = service.hasAnyRole([
          PerfilUsuario.ROLE_ADMIN,
          PerfilUsuario.ROLE_COMPLIANCE
        ]);

        // Assert
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockLoginResponse);
    });

    it('should return false if user does not have any of the specified roles', (done) => {
      // Arrange
      const credentials: LoginRequest = { email: 'admin@sgc.com', senha: 'senha123' };

      service.login(credentials).subscribe(() => {
        // Act
        const result = service.hasAnyRole([
          PerfilUsuario.ROLE_RESPONSAVEL,
          PerfilUsuario.ROLE_VISUALIZADOR
        ]);

        // Assert
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(mockLoginResponse);
    });

    it('should return false if no user is logged in', () => {
      // Act
      const result = service.hasAnyRole([PerfilUsuario.ROLE_ADMIN]);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit null initially when no user is stored', (done) => {
      // Act & Assert
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should emit stored user on service initialization', (done) => {
      // Arrange
      localStorage.setItem('sgc_user', JSON.stringify(mockLoginResponse));

      // Recreate service to trigger getUserFromStorage
      const newService = new AuthService();

      // Act & Assert
      newService.currentUser$.subscribe(user => {
        expect(user).toEqual(mockLoginResponse);
        done();
      });
    });
  });
});
