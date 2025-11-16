import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EvidenciaService } from './evidencia.service';
import { EvidenciaCreate, EvidenciaResponse, TipoEvidencia } from '../models/evidencia.model';

describe('EvidenciaService', () => {
  let service: EvidenciaService;
  let httpMock: HttpTestingController;

  const mockEvidenciaArquivo: EvidenciaResponse = {
    evidenciaId: 1,
    tipo: TipoEvidencia.ARQUIVO,
    descricao: 'Comprovante de pagamento',
    nomeArquivoOriginal: 'comprovante.pdf',
    caminhoArquivo: '/uploads/comprovante.pdf',
    tamanhoBytes: 2048,
    mimeType: 'application/pdf',
    dataSubmissao: '2025-01-01T10:00:00',
    ativo: true
  };

  const mockEvidenciaLink: EvidenciaResponse = {
    evidenciaId: 2,
    tipo: TipoEvidencia.LINK,
    descricao: 'Link para documento',
    urlExterna: 'https://example.com/doc',
    dataSubmissao: '2025-01-01T11:00:00',
    ativo: true
  };

  const mockEvidenciaTexto: EvidenciaResponse = {
    evidenciaId: 3,
    tipo: TipoEvidencia.TEXTO,
    descricao: 'Observações',
    conteudoTexto: 'Texto de evidência',
    dataSubmissao: '2025-01-01T12:00:00',
    ativo: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvidenciaService]
    });

    service = TestBed.inject(EvidenciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('adicionarArquivo', () => {
    it('should upload file with descricao', (done) => {
      // Arrange
      const obrigacaoId = 1;
      const mockFile = new File(['conteudo'], 'teste.pdf', { type: 'application/pdf' });
      const descricao = 'Descrição do arquivo';

      // Act
      service.adicionarArquivo(obrigacaoId, mockFile, descricao).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockEvidenciaArquivo);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/evidencias/obrigacao/${obrigacaoId}/arquivo`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);

      // Verify FormData contents
      const formData = req.request.body as FormData;
      expect(formData.get('arquivo')).toBe(mockFile);
      expect(formData.get('descricao')).toBe(descricao);

      req.flush(mockEvidenciaArquivo);
    });

    it('should upload file without descricao', (done) => {
      // Arrange
      const obrigacaoId = 1;
      const mockFile = new File(['conteudo'], 'teste.pdf', { type: 'application/pdf' });

      // Act
      service.adicionarArquivo(obrigacaoId, mockFile).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockEvidenciaArquivo);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/evidencias/obrigacao/${obrigacaoId}/arquivo`);
      expect(req.request.method).toBe('POST');

      // Verify FormData contents
      const formData = req.request.body as FormData;
      expect(formData.get('arquivo')).toBe(mockFile);
      expect(formData.get('descricao')).toBeNull();

      req.flush(mockEvidenciaArquivo);
    });
  });

  describe('adicionarLink', () => {
    it('should add link evidencia', (done) => {
      // Arrange
      const obrigacaoId = 1;
      const evidencia: EvidenciaCreate = {
        descricao: 'Link para documento',
        urlExterna: 'https://example.com/doc'
      };

      // Act
      service.adicionarLink(obrigacaoId, evidencia).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockEvidenciaLink);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/evidencias/obrigacao/${obrigacaoId}/link`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(evidencia);

      req.flush(mockEvidenciaLink);
    });
  });

  describe('adicionarTexto', () => {
    it('should add text evidencia', (done) => {
      // Arrange
      const obrigacaoId = 1;
      const evidencia: EvidenciaCreate = {
        descricao: 'Observações',
        conteudoTexto: 'Texto de evidência'
      };

      // Act
      service.adicionarTexto(obrigacaoId, evidencia).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockEvidenciaTexto);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/evidencias/obrigacao/${obrigacaoId}/texto`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(evidencia);

      req.flush(mockEvidenciaTexto);
    });
  });

  describe('listarPorObrigacao', () => {
    it('should list evidencias for obrigacao', (done) => {
      // Arrange
      const obrigacaoId = 1;
      const mockEvidencias = [mockEvidenciaArquivo, mockEvidenciaLink, mockEvidenciaTexto];

      // Act
      service.listarPorObrigacao(obrigacaoId).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockEvidencias);
          expect(response.length).toBe(3);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/evidencias/obrigacao/${obrigacaoId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockEvidencias);
    });
  });

  describe('downloadArquivo', () => {
    it('should download file as Blob', (done) => {
      // Arrange
      const evidenciaId = 1;
      const mockBlob = new Blob(['conteudo do arquivo'], { type: 'application/pdf' });

      // Act
      service.downloadArquivo(evidenciaId).subscribe({
        next: (response) => {
          // Assert
          expect(response instanceof Blob).toBe(true);
          expect(response.type).toBe('application/pdf');
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/evidencias/${evidenciaId}/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');

      req.flush(mockBlob);
    });
  });

  describe('excluir', () => {
    it('should delete evidencia by id', (done) => {
      // Arrange
      const evidenciaId = 1;

      // Act
      service.excluir(evidenciaId).subscribe({
        next: () => {
          // Assert
          expect(true).toBe(true);
          done();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`/api/v1/evidencias/${evidenciaId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });

  describe('salvarArquivo', () => {
    it('should trigger download using anchor element', () => {
      // Arrange
      const mockBlob = new Blob(['conteudo do arquivo'], { type: 'application/pdf' });
      const nomeArquivo = 'documento.pdf';

      // Spy on document.createElement
      const linkElement = document.createElement('a');
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(linkElement);
      const clickSpy = jest.spyOn(linkElement, 'click');

      // Act
      service.salvarArquivo(mockBlob, nomeArquivo);

      // Assert
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(linkElement.href).toBe('blob:mock-url');
      expect(linkElement.download).toBe(nomeArquivo);
      expect(clickSpy).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

      // Cleanup
      createElementSpy.mockRestore();
      clickSpy.mockRestore();
    });

    it('should handle Blob creation and cleanup correctly', () => {
      // Arrange
      const mockBlob = new Blob(['test data'], { type: 'text/plain' });
      const nomeArquivo = 'test.txt';

      // Spy on URL methods
      const createObjectURLSpy = jest.spyOn(window.URL, 'createObjectURL');
      const revokeObjectURLSpy = jest.spyOn(window.URL, 'revokeObjectURL');

      const linkElement = document.createElement('a');
      jest.spyOn(document, 'createElement').mockReturnValue(linkElement);
      jest.spyOn(linkElement, 'click');

      // Act
      service.salvarArquivo(mockBlob, nomeArquivo);

      // Assert
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
