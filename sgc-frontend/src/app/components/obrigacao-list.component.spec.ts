import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ObrigacaoListComponent } from './obrigacao-list.component';
import { ObrigacaoService, Page } from '../services/obrigacao.service';
import { AuthService } from '../services/auth.service';
import { ObrigacaoResponse, StatusObrigacao } from '../models/obrigacao.model';
import { PerfilUsuario, LoginResponse } from '../models/auth.model';
import { MessageService, ConfirmationService } from 'primeng/api';

describe('ObrigacaoListComponent', () => {
  let component: ObrigacaoListComponent;
  let fixture: ComponentFixture<ObrigacaoListComponent>;
  let obrigacaoService: ObrigacaoService;
  let authService: AuthService;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;
  let routerMock: jest.Mocked<Router>;

  const mockObrigacao: ObrigacaoResponse = {
    obrigacaoId: 1,
    titulo: 'Obrigação Teste',
    descricao: 'Descrição',
    status: StatusObrigacao.PENDENTE,
    prazoExecucao: '2025-12-31',
    responsavelId: 1,
    responsavelNome: 'João Silva',
    ativo: true,
    criadoEm: '2025-01-01T00:00:00'
  };

  const mockPage: Page<ObrigacaoResponse> = {
    content: [mockObrigacao],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0
  };

  const mockAdminUser: LoginResponse = {
    token: 'token',
    tipo: 'Bearer',
    email: 'admin@sgc.com',
    nome: 'Admin',
    perfil: PerfilUsuario.ROLE_ADMIN
  };

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ObrigacaoListComponent, HttpClientTestingModule],
      providers: [
        ObrigacaoService,
        AuthService,
        MessageService,
        ConfirmationService,
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ObrigacaoListComponent);
    component = fixture.componentInstance;
    obrigacaoService = TestBed.inject(ObrigacaoService);
    authService = TestBed.inject(AuthService);
    messageService = TestBed.inject(MessageService);
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load obrigacoes on init', () => {
      // Arrange
      const listarSpy = jest.spyOn(obrigacaoService, 'listar').mockReturnValue(of(mockPage));

      // Act
      component.ngOnInit();

      // Assert
      expect(listarSpy).toHaveBeenCalled();
    });

    it('should set obrigacoes and totalRecords after loading', (done) => {
      // Arrange
      jest.spyOn(obrigacaoService, 'listar').mockReturnValue(of(mockPage));

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.obrigacoes).toEqual([mockObrigacao]);
        expect(component.totalRecords).toBe(1);
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should handle error on initial load', (done) => {
      // Arrange
      const addSpy = jest.spyOn(messageService, 'add');
      jest.spyOn(obrigacaoService, 'listar').mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      // Act
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(addSpy).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigações'
        });
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('loadObrigacoes', () => {
    it('should load obrigacoes with default pagination', (done) => {
      // Arrange
      const listarSpy = jest.spyOn(obrigacaoService, 'listar').mockReturnValue(of(mockPage));

      // Act
      component.loadObrigacoes();

      // Assert
      setTimeout(() => {
        expect(listarSpy).toHaveBeenCalledWith(undefined, 0, 20);
        expect(component.obrigacoes).toEqual([mockObrigacao]);
        done();
      }, 100);
    });

    it('should load obrigacoes with status filter', (done) => {
      // Arrange
      const listarSpy = jest.spyOn(obrigacaoService, 'listar').mockReturnValue(of(mockPage));
      component.selectedStatus = StatusObrigacao.PENDENTE;

      // Act
      component.loadObrigacoes();

      // Assert
      setTimeout(() => {
        expect(listarSpy).toHaveBeenCalledWith(
          { status: StatusObrigacao.PENDENTE },
          0,
          20
        );
        done();
      }, 100);
    });

    it('should load obrigacoes with custom page', (done) => {
      // Arrange
      const listarSpy = jest.spyOn(obrigacaoService, 'listar').mockReturnValue(of(mockPage));

      // Act
      component.loadObrigacoes(2);

      // Assert
      setTimeout(() => {
        expect(listarSpy).toHaveBeenCalledWith(undefined, 2, 20);
        done();
      }, 100);
    });
  });

  describe('loadAtrasadas', () => {
    it('should load atrasadas obrigacoes', (done) => {
      // Arrange
      const atrasadas = [mockObrigacao];
      const buscarAtrasSpy = jest.spyOn(obrigacaoService, 'buscarAtrasadas').mockReturnValue(of(atrasadas));

      // Act
      component.loadAtrasadas();

      // Assert
      setTimeout(() => {
        expect(buscarAtrasSpy).toHaveBeenCalled();
        expect(component.obrigacoes).toEqual(atrasadas);
        expect(component.totalRecords).toBe(1);
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should handle error when loading atrasadas', (done) => {
      // Arrange
      const addSpy = jest.spyOn(messageService, 'add');
      jest.spyOn(obrigacaoService, 'buscarAtrasadas').mockReturnValue(
        throwError(() => new Error('Error'))
      );

      // Act
      component.loadAtrasadas();

      // Assert
      setTimeout(() => {
        expect(addSpy).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigações atrasadas'
        });
        done();
      }, 100);
    });
  });

  describe('Pagination', () => {
    it('should handle page change event', () => {
      // Arrange
      const loadSpy = jest.spyOn(component, 'loadObrigacoes');
      const event = { first: 20, rows: 20 };

      // Act
      component.onPageChange(event);

      // Assert
      expect(loadSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('visualizar', () => {
    it('should navigate to obrigacao detail page', () => {
      // Act
      component.visualizar(mockObrigacao);

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/obrigacoes', 1]);
    });
  });

  describe('submeter', () => {
    it('should submit obrigacao after confirmation', (done) => {
      // Arrange
      const submeterSpy = jest.spyOn(obrigacaoService, 'submeter').mockReturnValue(
        of({ ...mockObrigacao, status: StatusObrigacao.SUBMETIDA })
      );
      const loadSpy = jest.spyOn(component, 'loadObrigacoes').mockReturnValue();
      const addSpy = jest.spyOn(messageService, 'add');

      // Mock confirmation
      jest.spyOn(confirmationService, 'confirm').mockImplementation((config: any) => {
        config.accept();
        return confirmationService as any;
      });

      // Act
      component.submeter(mockObrigacao);

      // Assert
      setTimeout(() => {
        expect(submeterSpy).toHaveBeenCalledWith(1);
        expect(addSpy).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Obrigação submetida para aprovação'
        });
        expect(loadSpy).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle error on submit', (done) => {
      // Arrange
      jest.spyOn(obrigacaoService, 'submeter').mockReturnValue(
        throwError(() => new Error('Error'))
      );
      const addSpy = jest.spyOn(messageService, 'add');

      jest.spyOn(confirmationService, 'confirm').mockImplementation((config: any) => {
        config.accept();
        return confirmationService as any;
      });

      // Act
      component.submeter(mockObrigacao);

      // Assert
      setTimeout(() => {
        expect(addSpy).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao submeter obrigação'
        });
        done();
      }, 100);
    });
  });

  describe('aprovar', () => {
    it('should approve obrigacao with motivo', (done) => {
      // Arrange
      const aprovarSpy = jest.spyOn(obrigacaoService, 'aprovar').mockReturnValue(
        of({ ...mockObrigacao, status: StatusObrigacao.APROVADA })
      );
      const loadSpy = jest.spyOn(component, 'loadObrigacoes').mockReturnValue();
      const addSpy = jest.spyOn(messageService, 'add');

      // Mock prompt
      global.prompt = jest.fn().mockReturnValue('Tudo certo!');

      // Act
      component.aprovar(mockObrigacao);

      // Assert
      setTimeout(() => {
        expect(aprovarSpy).toHaveBeenCalledWith(1, { motivoAprovacao: 'Tudo certo!' });
        expect(addSpy).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Obrigação aprovada'
        });
        expect(loadSpy).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should approve obrigacao without motivo', (done) => {
      // Arrange
      const aprovarSpy = jest.spyOn(obrigacaoService, 'aprovar').mockReturnValue(
        of({ ...mockObrigacao, status: StatusObrigacao.APROVADA })
      );

      global.prompt = jest.fn().mockReturnValue('');

      // Act
      component.aprovar(mockObrigacao);

      // Assert
      setTimeout(() => {
        expect(aprovarSpy).toHaveBeenCalledWith(1, { motivoAprovacao: undefined });
        done();
      }, 100);
    });

    it('should handle error on approve', (done) => {
      // Arrange
      jest.spyOn(obrigacaoService, 'aprovar').mockReturnValue(
        throwError(() => new Error('Error'))
      );
      const addSpy = jest.spyOn(messageService, 'add');
      global.prompt = jest.fn().mockReturnValue('Aprovado');

      // Act
      component.aprovar(mockObrigacao);

      // Assert
      setTimeout(() => {
        expect(addSpy).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao aprovar obrigação'
        });
        done();
      }, 100);
    });
  });

  describe('rejeitar', () => {
    it('should reject obrigacao with motivo', (done) => {
      // Arrange
      const rejeitarSpy = jest.spyOn(obrigacaoService, 'rejeitar').mockReturnValue(
        of({ ...mockObrigacao, status: StatusObrigacao.REJEITADA })
      );
      const loadSpy = jest.spyOn(component, 'loadObrigacoes').mockReturnValue();
      const addSpy = jest.spyOn(messageService, 'add');

      global.prompt = jest.fn().mockReturnValue('Documentação incompleta');

      // Act
      component.rejeitar(mockObrigacao);

      // Assert
      setTimeout(() => {
        expect(rejeitarSpy).toHaveBeenCalledWith(1, { motivoRejeicao: 'Documentação incompleta' });
        expect(addSpy).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Obrigação rejeitada'
        });
        expect(loadSpy).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should show warning if motivo is empty', () => {
      // Arrange
      const addSpy = jest.spyOn(messageService, 'add');
      global.prompt = jest.fn().mockReturnValue('');

      // Act
      component.rejeitar(mockObrigacao);

      // Assert
      expect(addSpy).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Motivo da rejeição é obrigatório'
      });
    });

    it('should show warning if motivo is null', () => {
      // Arrange
      const addSpy = jest.spyOn(messageService, 'add');
      global.prompt = jest.fn().mockReturnValue(null);

      // Act
      component.rejeitar(mockObrigacao);

      // Assert
      expect(addSpy).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Motivo da rejeição é obrigatório'
      });
    });
  });

  describe('novaObrigacao', () => {
    it('should navigate to nova obrigacao page', () => {
      // Act
      component.novaObrigacao();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/obrigacoes/nova']);
    });
  });

  describe('canSubmit', () => {
    it('should return true for PENDENTE status', () => {
      // Arrange
      const pendente = { ...mockObrigacao, status: StatusObrigacao.PENDENTE };

      // Act
      const result = component.canSubmit(pendente);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for SUBMETIDA status', () => {
      // Arrange
      const submetida = { ...mockObrigacao, status: StatusObrigacao.SUBMETIDA };

      // Act
      const result = component.canSubmit(submetida);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canApprove', () => {
    it('should return true for SUBMETIDA with ADMIN role', () => {
      // Arrange
      const submetida = { ...mockObrigacao, status: StatusObrigacao.SUBMETIDA };
      jest.spyOn(authService, 'hasAnyRole').mockReturnValue(true);

      // Act
      const result = component.canApprove(submetida);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for PENDENTE even with ADMIN role', () => {
      // Arrange
      const pendente = { ...mockObrigacao, status: StatusObrigacao.PENDENTE };
      jest.spyOn(authService, 'hasAnyRole').mockReturnValue(true);

      // Act
      const result = component.canApprove(pendente);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for SUBMETIDA without proper role', () => {
      // Arrange
      const submetida = { ...mockObrigacao, status: StatusObrigacao.SUBMETIDA };
      jest.spyOn(authService, 'hasAnyRole').mockReturnValue(false);

      // Act
      const result = component.canApprove(submetida);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity for each status', () => {
      expect(component.getStatusSeverity(StatusObrigacao.PENDENTE)).toBe('warning');
      expect(component.getStatusSeverity(StatusObrigacao.SUBMETIDA)).toBe('info');
      expect(component.getStatusSeverity(StatusObrigacao.APROVADA)).toBe('success');
      expect(component.getStatusSeverity(StatusObrigacao.REJEITADA)).toBe('danger');
    });
  });

  describe('canCreate', () => {
    it('should return true for ADMIN role', () => {
      // Arrange
      jest.spyOn(authService, 'hasAnyRole').mockReturnValue(true);

      // Act
      const result = component.canCreate;

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for VISUALIZADOR role', () => {
      // Arrange
      jest.spyOn(authService, 'hasAnyRole').mockReturnValue(false);

      // Act
      const result = component.canCreate;

      // Assert
      expect(result).toBe(false);
    });
  });
});
