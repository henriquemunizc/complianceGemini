import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';
import { ObrigacaoService, Page } from './obrigacao.service';
import {
  ObrigacaoCreate,
  ObrigacaoUpdate,
  ObrigacaoResponse,
  StatusObrigacao,
  AprovarObrigacao,
  RejeitarObrigacao
} from '../models/obrigacao.model';

describe('ObrigacaoService', () => {
  let service: ObrigacaoService;
  let httpMock: HttpTestingController;

  const mockObrigacao: ObrigacaoResponse = {
    obrigacaoId: 1,
    titulo: 'Obrigação Teste',
    descricao: 'Descrição da obrigação',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ObrigacaoService]
    });

    service = TestBed.inject(ObrigacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('criar', () => {
    it('should create a new obrigacao', (done) => {
      // Arrange
      const newObrigacao: ObrigacaoCreate = {
        titulo: 'Nova Obrigação',
        descricao: 'Descrição',
        prazoExecucao: '2025-12-31',
        responsavelId: 1,
        vinculosHierarquia: [{ normaId: 1 }]
      };

      // Act
      service.criar(newObrigacao).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockObrigacao);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('/api/v1/obrigacoes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newObrigacao);

      req.flush(mockObrigacao);
    });
  });

  describe('atualizar', () => {
    it('should update an existing obrigacao', (done) => {
      // Arrange
      const update: ObrigacaoUpdate = {
        titulo: 'Título Atualizado',
        descricao: 'Descrição Atualizada'
      };
      const id = 1;

      // Act
      service.atualizar(id, update).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockObrigacao);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/obrigacoes/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);

      req.flush(mockObrigacao);
    });
  });

  describe('submeter', () => {
    it('should submit an obrigacao for approval', (done) => {
      // Arrange
      const id = 1;
      const submittedObrigacao = { ...mockObrigacao, status: StatusObrigacao.SUBMETIDA };

      // Act
      service.submeter(id).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(submittedObrigacao);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/obrigacoes/${id}/submeter`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});

      req.flush(submittedObrigacao);
    });
  });

  describe('aprovar', () => {
    it('should approve an obrigacao with motivo', (done) => {
      // Arrange
      const id = 1;
      const dto: AprovarObrigacao = { motivoAprovacao: 'Tudo certo!' };
      const approvedObrigacao = {
        ...mockObrigacao,
        status: StatusObrigacao.APROVADA,
        motivoAprovacao: 'Tudo certo!'
      };

      // Act
      service.aprovar(id, dto).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(approvedObrigacao);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/obrigacoes/${id}/aprovar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);

      req.flush(approvedObrigacao);
    });

    it('should approve an obrigacao without motivo', (done) => {
      // Arrange
      const id = 1;
      const dto: AprovarObrigacao = {};
      const approvedObrigacao = { ...mockObrigacao, status: StatusObrigacao.APROVADA };

      // Act
      service.aprovar(id, dto).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(approvedObrigacao);
          done();
        }
      });

      const req = httpMock.expectOne(`/api/v1/obrigacoes/${id}/aprovar`);
      req.flush(approvedObrigacao);
    });
  });

  describe('rejeitar', () => {
    it('should reject an obrigacao with motivo', (done) => {
      // Arrange
      const id = 1;
      const dto: RejeitarObrigacao = { motivoRejeicao: 'Documentação incompleta' };
      const rejectedObrigacao = {
        ...mockObrigacao,
        status: StatusObrigacao.REJEITADA,
        motivoRejeicao: 'Documentação incompleta'
      };

      // Act
      service.rejeitar(id, dto).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(rejectedObrigacao);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/obrigacoes/${id}/rejeitar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);

      req.flush(rejectedObrigacao);
    });
  });

  describe('buscarPorId', () => {
    it('should fetch obrigacao by id', (done) => {
      // Arrange
      const id = 1;

      // Act
      service.buscarPorId(id).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockObrigacao);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/obrigacoes/${id}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockObrigacao);
    });
  });

  describe('listar', () => {
    it('should list obrigacoes with default pagination', (done) => {
      // Act
      service.listar().subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockPage);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne((request) => {
        return request.url === '/api/v1/obrigacoes' &&
               request.params.get('page') === '0' &&
               request.params.get('size') === '20';
      });
      expect(req.request.method).toBe('GET');

      req.flush(mockPage);
    });

    it('should list obrigacoes with status filter', (done) => {
      // Arrange
      const filters = { status: StatusObrigacao.PENDENTE };

      // Act
      service.listar(filters, 0, 20).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockPage);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne((request) => {
        return request.url === '/api/v1/obrigacoes' &&
               request.params.get('status') === StatusObrigacao.PENDENTE &&
               request.params.get('page') === '0' &&
               request.params.get('size') === '20';
      });
      expect(req.request.method).toBe('GET');

      req.flush(mockPage);
    });

    it('should list obrigacoes with responsavelId filter', (done) => {
      // Arrange
      const filters = { responsavelId: 5 };

      // Act
      service.listar(filters, 0, 20).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockPage);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne((request) => {
        return request.url === '/api/v1/obrigacoes' &&
               request.params.get('responsavelId') === '5' &&
               request.params.get('page') === '0' &&
               request.params.get('size') === '20';
      });
      expect(req.request.method).toBe('GET');

      req.flush(mockPage);
    });

    it('should list obrigacoes with atrasada filter set to true', (done) => {
      // Arrange
      const filters = { atrasada: true };

      // Act
      service.listar(filters, 0, 20).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockPage);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne((request) => {
        return request.url === '/api/v1/obrigacoes' &&
               request.params.get('atrasada') === 'true' &&
               request.params.get('page') === '0' &&
               request.params.get('size') === '20';
      });
      expect(req.request.method).toBe('GET');

      req.flush(mockPage);
    });

    it('should list obrigacoes with atrasada filter set to false', (done) => {
      // Arrange
      const filters = { atrasada: false };

      // Act
      service.listar(filters, 0, 20).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockPage);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne((request) => {
        return request.url === '/api/v1/obrigacoes' &&
               request.params.get('atrasada') === 'false' &&
               request.params.get('page') === '0' &&
               request.params.get('size') === '20';
      });
      expect(req.request.method).toBe('GET');

      req.flush(mockPage);
    });

    it('should list obrigacoes with multiple filters', (done) => {
      // Arrange
      const filters = {
        status: StatusObrigacao.SUBMETIDA,
        responsavelId: 3,
        atrasada: true
      };

      // Act
      service.listar(filters, 1, 10).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockPage);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne((request) => {
        return request.url === '/api/v1/obrigacoes' &&
               request.params.get('status') === StatusObrigacao.SUBMETIDA &&
               request.params.get('responsavelId') === '3' &&
               request.params.get('atrasada') === 'true' &&
               request.params.get('page') === '1' &&
               request.params.get('size') === '10';
      });
      expect(req.request.method).toBe('GET');

      req.flush(mockPage);
    });
  });

  describe('buscarAtrasadas', () => {
    it('should fetch atrasadas obrigacoes', (done) => {
      // Arrange
      const atrasadas = [mockObrigacao];

      // Act
      service.buscarAtrasadas().subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(atrasadas);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('/api/v1/obrigacoes/atrasadas');
      expect(req.request.method).toBe('GET');

      req.flush(atrasadas);
    });
  });

  describe('excluir', () => {
    it('should delete obrigacao by id', (done) => {
      // Arrange
      const id = 1;

      // Act
      service.excluir(id).subscribe({
        next: () => {
          // Assert
          expect(true).toBe(true);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/obrigacoes/${id}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });
});
