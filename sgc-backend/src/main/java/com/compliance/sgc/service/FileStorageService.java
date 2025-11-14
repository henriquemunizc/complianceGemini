package com.compliance.sgc.service;

import com.compliance.sgc.exception.BusinessValidationException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

  private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

  private final Path fileStorageLocation;
  private final long maxFileSize;
  private final List<String> allowedExtensions;

  // MIME types permitidos (lista branca)
  private static final List<String> ALLOWED_MIME_TYPES =
      Arrays.asList(
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
          "image/png",
          "image/jpeg");

  // Assinaturas de arquivo (magic numbers) para validação
  private static final byte[] PDF_SIGNATURE = {0x25, 0x50, 0x44, 0x46}; // %PDF
  private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 0x50, 0x4E, 0x47}; // .PNG
  private static final byte[] JPEG_SIGNATURE = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};

  public FileStorageService(
      @Value("${file.upload.directory:uploads}") String uploadDirectory,
      @Value("${file.upload.max-file-size:10485760}") long maxFileSize,
      @Value("${file.upload.allowed-extensions:pdf,docx,xlsx,png,jpg,jpeg}")
          String allowedExtensions) {
    this.maxFileSize = maxFileSize;
    this.allowedExtensions = Arrays.asList(allowedExtensions.split(","));

    this.fileStorageLocation = Paths.get(uploadDirectory).toAbsolutePath().normalize();

    try {
      Files.createDirectories(this.fileStorageLocation);
      logger.info("Diretório de upload criado/verificado: {}", this.fileStorageLocation);
    } catch (IOException ex) {
      throw new RuntimeException(
          "Não foi possível criar diretório de upload: " + this.fileStorageLocation, ex);
    }
  }

  /**
   * Armazena arquivo com validações de segurança completas.
   *
   * @param file Arquivo enviado
   * @return Caminho relativo do arquivo armazenado
   */
  public String storeFile(MultipartFile file) {
    logger.info("Iniciando armazenamento de arquivo: {}", file.getOriginalFilename());

    // Validação 1: Arquivo não pode ser nulo ou vazio
    if (file.isEmpty()) {
      throw new BusinessValidationException("Arquivo está vazio");
    }

    // Validação 2: Tamanho do arquivo
    if (file.getSize() > maxFileSize) {
      throw new BusinessValidationException(
          String.format(
              "Arquivo excede o tamanho máximo permitido: %d bytes (máx: %d bytes)",
              file.getSize(), maxFileSize));
    }

    // Validação 3: Nome do arquivo (proteção contra path traversal)
    String fileName =
        StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
    if (fileName.contains("..")) {
      throw new BusinessValidationException(
          "Nome do arquivo contém sequência inválida: " + fileName);
    }

    // Validação 4: Extensão do arquivo
    String extension = getFileExtension(fileName);
    if (extension == null || !allowedExtensions.contains(extension.toLowerCase())) {
      throw new BusinessValidationException(
          String.format(
              "Extensão de arquivo não permitida: %s. Permitidas: %s",
              extension, allowedExtensions));
    }

    // Validação 5: Tipo MIME (Content-Type)
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
      throw new BusinessValidationException(
          String.format("Tipo de arquivo não permitido: %s", contentType));
    }

    // Validação 6: Assinatura do arquivo (magic number) - proteção contra spoofing
    try (InputStream inputStream = file.getInputStream()) {
      byte[] fileSignature = new byte[8];
      int bytesRead = inputStream.read(fileSignature);

      if (bytesRead < 4) {
        throw new BusinessValidationException("Arquivo corrompido ou inválido");
      }

      if (!isValidFileSignature(fileSignature, extension)) {
        logger.warn(
            "Assinatura de arquivo inválida para extensão {}: {}",
            extension,
            bytesToHex(fileSignature));
        throw new BusinessValidationException(
            "Arquivo não corresponde ao tipo declarado (possível falsificação)");
      }
    } catch (IOException ex) {
      throw new BusinessValidationException("Erro ao validar assinatura do arquivo", ex);
    }

    // Gerar nome único para evitar conflitos e enumeration attacks
    String uniqueFileName = generateUniqueFileName(fileName);

    try {
      // Copiar arquivo para o diretório de armazenamento
      Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);

      // Validação 7: Path traversal check no caminho final
      if (!targetLocation.normalize().startsWith(this.fileStorageLocation)) {
        throw new BusinessValidationException("Tentativa de path traversal detectada");
      }

      Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

      logger.info("Arquivo armazenado com sucesso: {}", uniqueFileName);
      return uniqueFileName;

    } catch (IOException ex) {
      logger.error("Erro ao armazenar arquivo: {}", fileName, ex);
      throw new BusinessValidationException("Erro ao armazenar arquivo", ex);
    }
  }

  /**
   * Calcula hash SHA-256 do arquivo para integridade.
   */
  public String calculateFileHash(MultipartFile file) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] fileBytes = file.getBytes();
      byte[] hashBytes = digest.digest(fileBytes);
      return bytesToHex(hashBytes);
    } catch (NoSuchAlgorithmException | IOException ex) {
      logger.error("Erro ao calcular hash do arquivo", ex);
      throw new BusinessValidationException("Erro ao calcular hash do arquivo", ex);
    }
  }

  /**
   * Deleta arquivo do sistema de arquivos.
   */
  public void deleteFile(String fileName) {
    try {
      Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

      // Validação: arquivo deve estar dentro do diretório permitido
      if (!filePath.startsWith(this.fileStorageLocation)) {
        throw new BusinessValidationException("Caminho de arquivo inválido");
      }

      Files.deleteIfExists(filePath);
      logger.info("Arquivo deletado: {}", fileName);
    } catch (IOException ex) {
      logger.error("Erro ao deletar arquivo: {}", fileName, ex);
      throw new BusinessValidationException("Erro ao deletar arquivo", ex);
    }
  }

  /**
   * Retorna o caminho completo do arquivo.
   */
  public Path getFilePath(String fileName) {
    Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

    if (!filePath.startsWith(this.fileStorageLocation)) {
      throw new BusinessValidationException("Caminho de arquivo inválido");
    }

    if (!Files.exists(filePath)) {
      throw new BusinessValidationException("Arquivo não encontrado: " + fileName);
    }

    return filePath;
  }

  /**
   * Retorna Resource para download do arquivo.
   */
  public org.springframework.core.io.Resource loadFileAsResource(String fileName) {
    try {
      Path filePath = getFilePath(fileName);
      org.springframework.core.io.Resource resource =
          new org.springframework.core.io.UrlResource(filePath.toUri());

      if (resource.exists() && resource.isReadable()) {
        return resource;
      } else {
        throw new BusinessValidationException("Arquivo não encontrado ou não é legível: " + fileName);
      }
    } catch (java.net.MalformedURLException ex) {
      throw new BusinessValidationException("Erro ao carregar arquivo: " + fileName, ex);
    }
  }

  private String getFileExtension(String fileName) {
    int lastIndexOf = fileName.lastIndexOf(".");
    if (lastIndexOf == -1) {
      return null;
    }
    return fileName.substring(lastIndexOf + 1);
  }

  private String generateUniqueFileName(String originalFileName) {
    String extension = getFileExtension(originalFileName);
    String uuid = UUID.randomUUID().toString();
    return uuid + (extension != null ? "." + extension : "");
  }

  private boolean isValidFileSignature(byte[] fileSignature, String extension) {
    String ext = extension.toLowerCase();

    switch (ext) {
      case "pdf":
        return startsWith(fileSignature, PDF_SIGNATURE);
      case "png":
        return startsWith(fileSignature, PNG_SIGNATURE);
      case "jpg":
      case "jpeg":
        return startsWith(fileSignature, JPEG_SIGNATURE);
      case "docx":
      case "xlsx":
        // DOCX e XLSX são arquivos ZIP (PK signature: 0x50 0x4B 0x03 0x04)
        return fileSignature[0] == 0x50 && fileSignature[1] == 0x4B;
      default:
        logger.warn("Extensão sem validação de assinatura: {}", ext);
        return true; // Permitir por enquanto, mas logar
    }
  }

  private boolean startsWith(byte[] array, byte[] prefix) {
    if (array.length < prefix.length) {
      return false;
    }
    for (int i = 0; i < prefix.length; i++) {
      if (array[i] != prefix[i]) {
        return false;
      }
    }
    return true;
  }

  private String bytesToHex(byte[] bytes) {
    StringBuilder sb = new StringBuilder();
    for (byte b : bytes) {
      sb.append(String.format("%02x", b));
    }
    return sb.toString();
  }
}
