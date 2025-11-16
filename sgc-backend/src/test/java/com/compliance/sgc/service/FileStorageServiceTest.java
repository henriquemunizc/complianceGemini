package com.compliance.sgc.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.compliance.sgc.exception.BusinessValidationException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@DisplayName("FileStorageService - Testes Unitários")
class FileStorageServiceTest {

  @TempDir Path tempDir;

  private FileStorageService fileStorageService;
  private Path uploadDirectory;

  @BeforeEach
  void setUp() throws IOException {
    uploadDirectory = tempDir.resolve("uploads");
    Files.createDirectories(uploadDirectory);

    // Configuração do service com diretório temporário
    fileStorageService =
        new FileStorageService(
            uploadDirectory.toString(),
            10485760L, // 10MB max size
            "pdf,docx,xlsx,png,jpg,jpeg");
  }

  @AfterEach
  void tearDown() throws IOException {
    // Limpar arquivos criados durante os testes
    if (Files.exists(uploadDirectory)) {
      Files.walk(uploadDirectory)
          .sorted((a, b) -> b.compareTo(a))
          .forEach(
              path -> {
                try {
                  Files.deleteIfExists(path);
                } catch (IOException e) {
                  // Ignorar erros de limpeza
                }
              });
    }
  }

  @Nested
  @DisplayName("Store File - Casos de Sucesso")
  class StoreFileSuccessTests {

    @Test
    @DisplayName("Deve armazenar arquivo PDF válido")
    void deveArmazenarArquivoPdfValido() throws Exception {
      // Given - PDF signature: %PDF
      byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "documento.pdf", "application/pdf", pdfContent);

      // When
      String fileName = fileStorageService.storeFile(file);

      // Then
      assertThat(fileName).isNotNull();
      assertThat(fileName).endsWith(".pdf");
      assertThat(Files.exists(uploadDirectory.resolve(fileName))).isTrue();
    }

    @Test
    @DisplayName("Deve armazenar arquivo PNG válido")
    void deveArmazenarArquivoPngValido() throws Exception {
      // Given - PNG signature: .PNG
      byte[] pngContent = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "imagem.png", "image/png", pngContent);

      // When
      String fileName = fileStorageService.storeFile(file);

      // Then
      assertThat(fileName).isNotNull();
      assertThat(fileName).endsWith(".png");
      assertThat(Files.exists(uploadDirectory.resolve(fileName))).isTrue();
    }

    @Test
    @DisplayName("Deve armazenar arquivo JPEG válido")
    void deveArmazenarArquivoJpegValido() throws Exception {
      // Given - JPEG signature: 0xFF 0xD8 0xFF
      byte[] jpegContent =
          new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "foto.jpg", "image/jpeg", jpegContent);

      // When
      String fileName = fileStorageService.storeFile(file);

      // Then
      assertThat(fileName).isNotNull();
      assertThat(fileName).endsWith(".jpg");
      assertThat(Files.exists(uploadDirectory.resolve(fileName))).isTrue();
    }

    @Test
    @DisplayName("Deve armazenar arquivo DOCX válido")
    void deveArmazenarArquivoDocxValido() throws Exception {
      // Given - DOCX/ZIP signature: PK
      byte[] docxContent = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00};
      MockMultipartFile file =
          new MockMultipartFile(
              "file",
              "documento.docx",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              docxContent);

      // When
      String fileName = fileStorageService.storeFile(file);

      // Then
      assertThat(fileName).isNotNull();
      assertThat(fileName).endsWith(".docx");
      assertThat(Files.exists(uploadDirectory.resolve(fileName))).isTrue();
    }

    @Test
    @DisplayName("Deve armazenar arquivo XLSX válido")
    void deveArmazenarArquivoXlsxValido() throws Exception {
      // Given - XLSX/ZIP signature: PK
      byte[] xlsxContent = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00};
      MockMultipartFile file =
          new MockMultipartFile(
              "file",
              "planilha.xlsx",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              xlsxContent);

      // When
      String fileName = fileStorageService.storeFile(file);

      // Then
      assertThat(fileName).isNotNull();
      assertThat(fileName).endsWith(".xlsx");
      assertThat(Files.exists(uploadDirectory.resolve(fileName))).isTrue();
    }
  }

  @Nested
  @DisplayName("Store File - Validações de Segurança")
  class StoreFileSecurityTests {

    @Test
    @DisplayName("Deve lançar exceção quando arquivo está vazio")
    void deveLancarExcecaoQuandoArquivoVazio() {
      // Given
      MockMultipartFile file =
          new MockMultipartFile("file", "vazio.pdf", "application/pdf", new byte[0]);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("vazio");
    }

    @Test
    @DisplayName("Deve lançar exceção quando arquivo excede tamanho máximo")
    void deveLancarExcecaoQuandoArquivoExcedeTamanho() {
      // Given
      byte[] largeContent = new byte[11 * 1024 * 1024]; // 11MB
      MockMultipartFile file =
          new MockMultipartFile("file", "grande.pdf", "application/pdf", largeContent);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("excede")
          .hasMessageContaining("tamanho máximo");
    }

    @Test
    @DisplayName("Deve lançar exceção quando há path traversal no nome (..))")
    void deveLancarExcecaoQuandoPathTraversal() {
      // Given
      byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "../../../etc/passwd.pdf", "application/pdf", pdfContent);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("sequência inválida");
    }

    @Test
    @DisplayName("Deve lançar exceção quando extensão não é permitida")
    void deveLancarExcecaoQuandoExtensaoNaoPermitida() {
      // Given
      byte[] content = new byte[]{0x00, 0x01, 0x02};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "script.exe", "application/octet-stream", content);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("Extensão de arquivo não permitida");
    }

    @Test
    @DisplayName("Deve lançar exceção quando MIME type não é permitido")
    void deveLancarExcecaoQuandoMimeTypeNaoPermitido() {
      // Given
      byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "documento.pdf", "application/octet-stream", pdfContent);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("Tipo de arquivo não permitido");
    }

    @Test
    @DisplayName("Deve lançar exceção quando magic number não corresponde à extensão PDF")
    void deveLancarExcecaoQuandoMagicNumberInvalidoPdf() {
      // Given - Conteúdo que não é PDF mas extensão diz que é
      byte[] fakeContent = new byte[]{0x00, 0x00, 0x00, 0x00};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "falso.pdf", "application/pdf", fakeContent);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("falsificação");
    }

    @Test
    @DisplayName("Deve lançar exceção quando magic number não corresponde à extensão PNG")
    void deveLancarExcecaoQuandoMagicNumberInvalidoPng() {
      // Given - Conteúdo que não é PNG mas extensão diz que é
      byte[] fakeContent = new byte[]{0x00, 0x00, 0x00, 0x00};
      MockMultipartFile file =
          new MockMultipartFile("file", "falso.png", "image/png", fakeContent);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("falsificação");
    }

    @Test
    @DisplayName("Deve lançar exceção quando magic number não corresponde à extensão JPEG")
    void deveLancarExcecaoQuandoMagicNumberInvalidoJpeg() {
      // Given - Conteúdo que não é JPEG mas extensão diz que é
      byte[] fakeContent = new byte[]{0x00, 0x00, 0x00, 0x00};
      MockMultipartFile file =
          new MockMultipartFile("file", "falso.jpg", "image/jpeg", fakeContent);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("falsificação");
    }

    @Test
    @DisplayName("Deve lançar exceção quando arquivo está corrompido")
    void deveLancarExcecaoQuandoArquivoCorrompido() {
      // Given - Arquivo muito pequeno (menos de 4 bytes)
      byte[] corruptContent = new byte[]{0x00, 0x01};
      MockMultipartFile file =
          new MockMultipartFile(
              "file", "corrompido.pdf", "application/pdf", corruptContent);

      // When/Then
      assertThatThrownBy(() -> fileStorageService.storeFile(file))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("corrompido");
    }
  }

  @Nested
  @DisplayName("Calculate File Hash")
  class CalculateFileHashTests {

    @Test
    @DisplayName("Deve calcular hash SHA-256 do arquivo")
    void deveCalcularHashSha256DoArquivo() throws Exception {
      // Given
      byte[] content = "Conteúdo de teste".getBytes();
      MockMultipartFile file =
          new MockMultipartFile("file", "teste.txt", "text/plain", content);

      // When
      String hash = fileStorageService.calculateFileHash(file);

      // Then
      assertThat(hash).isNotNull();
      assertThat(hash).hasSize(64); // SHA-256 produces 64 hex characters
      assertThat(hash).matches("^[a-f0-9]{64}$");
    }

    @Test
    @DisplayName("Deve retornar hashes diferentes para conteúdos diferentes")
    void deveRetornarHashesDiferentesParaConteudosDiferentes() throws Exception {
      // Given
      MockMultipartFile file1 =
          new MockMultipartFile("file", "teste1.txt", "text/plain", "Conteúdo 1".getBytes());
      MockMultipartFile file2 =
          new MockMultipartFile("file", "teste2.txt", "text/plain", "Conteúdo 2".getBytes());

      // When
      String hash1 = fileStorageService.calculateFileHash(file1);
      String hash2 = fileStorageService.calculateFileHash(file2);

      // Then
      assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    @DisplayName("Deve retornar mesmo hash para conteúdos idênticos")
    void deveRetornarMesmoHashParaConteudosIdenticos() throws Exception {
      // Given
      byte[] content = "Conteúdo idêntico".getBytes();
      MockMultipartFile file1 =
          new MockMultipartFile("file", "teste1.txt", "text/plain", content);
      MockMultipartFile file2 =
          new MockMultipartFile("file", "teste2.txt", "text/plain", content);

      // When
      String hash1 = fileStorageService.calculateFileHash(file1);
      String hash2 = fileStorageService.calculateFileHash(file2);

      // Then
      assertThat(hash1).isEqualTo(hash2);
    }
  }

  @Nested
  @DisplayName("Delete File")
  class DeleteFileTests {

    @Test
    @DisplayName("Deve deletar arquivo existente")
    void deveDeletarArquivoExistente() throws Exception {
      // Given
      byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D};
      MockMultipartFile file =
          new MockMultipartFile("file", "documento.pdf", "application/pdf", pdfContent);
      String fileName = fileStorageService.storeFile(file);
      assertThat(Files.exists(uploadDirectory.resolve(fileName))).isTrue();

      // When
      fileStorageService.deleteFile(fileName);

      // Then
      assertThat(Files.exists(uploadDirectory.resolve(fileName))).isFalse();
    }

    @Test
    @DisplayName("Deve lançar exceção quando tentar path traversal na deleção")
    void deveLancarExcecaoQuandoPathTraversalNaDelecao() {
      // Given
      String maliciousPath = "../../etc/passwd";

      // When/Then
      assertThatThrownBy(() -> fileStorageService.deleteFile(maliciousPath))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("inválido");
    }

    @Test
    @DisplayName("Não deve lançar exceção ao deletar arquivo inexistente")
    void naoDeveLancarExcecaoAoDeletarArquivoInexistente() {
      // Given
      String fileName = "arquivo-inexistente.pdf";

      // When/Then - Não deve lançar exceção (deleteIfExists)
      fileStorageService.deleteFile(fileName);
    }
  }

  @Nested
  @DisplayName("Get File Path")
  class GetFilePathTests {

    @Test
    @DisplayName("Deve retornar caminho do arquivo existente")
    void deveRetornarCaminhoDoArquivoExistente() throws Exception {
      // Given
      byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D};
      MockMultipartFile file =
          new MockMultipartFile("file", "documento.pdf", "application/pdf", pdfContent);
      String fileName = fileStorageService.storeFile(file);

      // When
      Path filePath = fileStorageService.getFilePath(fileName);

      // Then
      assertThat(filePath).isNotNull();
      assertThat(Files.exists(filePath)).isTrue();
      assertThat(filePath.getFileName().toString()).isEqualTo(fileName);
    }

    @Test
    @DisplayName("Deve lançar exceção quando arquivo não existe")
    void deveLancarExcecaoQuandoArquivoNaoExiste() {
      // Given
      String fileName = "arquivo-inexistente.pdf";

      // When/Then
      assertThatThrownBy(() -> fileStorageService.getFilePath(fileName))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("não encontrado");
    }

    @Test
    @DisplayName("Deve lançar exceção quando há path traversal")
    void deveLancarExcecaoQuandoPathTraversal() {
      // Given
      String maliciousPath = "../../etc/passwd";

      // When/Then
      assertThatThrownBy(() -> fileStorageService.getFilePath(maliciousPath))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("inválido");
    }
  }

  @Nested
  @DisplayName("Load File As Resource")
  class LoadFileAsResourceTests {

    @Test
    @DisplayName("Deve carregar arquivo como Resource")
    void deveCarregarArquivoComoResource() throws Exception {
      // Given
      byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35};
      MockMultipartFile file =
          new MockMultipartFile("file", "documento.pdf", "application/pdf", pdfContent);
      String fileName = fileStorageService.storeFile(file);

      // When
      Resource resource = fileStorageService.loadFileAsResource(fileName);

      // Then
      assertThat(resource).isNotNull();
      assertThat(resource.exists()).isTrue();
      assertThat(resource.isReadable()).isTrue();
      assertThat(resource.contentLength()).isEqualTo(pdfContent.length);
    }

    @Test
    @DisplayName("Deve lançar exceção quando arquivo não existe")
    void deveLancarExcecaoQuandoArquivoNaoExiste() {
      // Given
      String fileName = "arquivo-inexistente.pdf";

      // When/Then
      assertThatThrownBy(() -> fileStorageService.loadFileAsResource(fileName))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("não encontrado");
    }

    @Test
    @DisplayName("Deve lançar exceção quando há path traversal")
    void deveLancarExcecaoQuandoPathTraversalNoLoad() {
      // Given
      String maliciousPath = "../../etc/passwd";

      // When/Then
      assertThatThrownBy(() -> fileStorageService.loadFileAsResource(maliciousPath))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("inválido");
    }
  }
}
