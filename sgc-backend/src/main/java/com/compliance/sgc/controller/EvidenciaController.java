package com.compliance.sgc.controller;

import com.compliance.sgc.domain.entity.Evidencia;
import com.compliance.sgc.dto.evidencia.EvidenciaCreateDTO;
import com.compliance.sgc.dto.evidencia.EvidenciaResponseDTO;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.EvidenciaRepository;
import com.compliance.sgc.service.EvidenciaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/evidencias")
public class EvidenciaController {

  private static final Logger logger = LoggerFactory.getLogger(EvidenciaController.class);

  private final EvidenciaService evidenciaService;
  private final EvidenciaRepository evidenciaRepository;

  public EvidenciaController(
      EvidenciaService evidenciaService, EvidenciaRepository evidenciaRepository) {
    this.evidenciaService = evidenciaService;
    this.evidenciaRepository = evidenciaRepository;
  }

  @PostMapping("/obrigacao/{obrigacaoId}/arquivo")
  public ResponseEntity<EvidenciaResponseDTO> adicionarArquivo(
      @PathVariable Long obrigacaoId,
      @RequestParam("arquivo") MultipartFile arquivo,
      @RequestParam(required = false) String descricao) {
    logger.info(
        "POST /api/v1/evidencias/obrigacao/{}/arquivo - Upload de arquivo", obrigacaoId);
    EvidenciaResponseDTO response =
        evidenciaService.adicionarEvidenciaArquivo(obrigacaoId, arquivo, descricao);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PostMapping("/obrigacao/{obrigacaoId}/link")
  public ResponseEntity<EvidenciaResponseDTO> adicionarLink(
      @PathVariable Long obrigacaoId, @Valid @RequestBody EvidenciaCreateDTO dto) {
    logger.info("POST /api/v1/evidencias/obrigacao/{}/link - Adicionar link", obrigacaoId);
    EvidenciaResponseDTO response = evidenciaService.adicionarEvidenciaLink(obrigacaoId, dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PostMapping("/obrigacao/{obrigacaoId}/texto")
  public ResponseEntity<EvidenciaResponseDTO> adicionarTexto(
      @PathVariable Long obrigacaoId, @Valid @RequestBody EvidenciaCreateDTO dto) {
    logger.info("POST /api/v1/evidencias/obrigacao/{}/texto - Adicionar texto", obrigacaoId);
    EvidenciaResponseDTO response = evidenciaService.adicionarEvidenciaTexto(obrigacaoId, dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @GetMapping("/obrigacao/{obrigacaoId}")
  public ResponseEntity<List<EvidenciaResponseDTO>> listarPorObrigacao(
      @PathVariable Long obrigacaoId) {
    logger.debug("GET /api/v1/evidencias/obrigacao/{} - Listar evidências", obrigacaoId);
    List<EvidenciaResponseDTO> response = evidenciaService.listarPorObrigacao(obrigacaoId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}/download")
  public ResponseEntity<Resource> downloadArquivo(
      @PathVariable Long id, HttpServletRequest request) {
    logger.info("GET /api/v1/evidencias/{}/download - Download de arquivo", id);

    // Carregar recurso
    Resource resource = evidenciaService.downloadArquivo(id);

    // Determinar Content-Type
    String contentType = null;
    try {
      contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
    } catch (IOException ex) {
      logger.warn("Não foi possível determinar tipo do arquivo");
    }

    if (contentType == null) {
      contentType = "application/octet-stream";
    }

    // Obter nome original do arquivo
    Evidencia evidencia =
        evidenciaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Evidencia", "id", id));

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + evidencia.getNomeArquivoOriginal() + "\"")
        .body(resource);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/evidencias/{} - Excluir evidência", id);
    evidenciaService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
