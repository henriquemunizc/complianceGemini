package com.compliance.sgc.controller;

import com.compliance.sgc.domain.entity.Evidencia;
import com.compliance.sgc.dto.evidencia.EvidenciaCreateDTO;
import com.compliance.sgc.dto.evidencia.EvidenciaResponseDTO;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.EvidenciaRepository;
import com.compliance.sgc.service.EvidenciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Evidências", description = "Endpoints para gerenciamento de evidências de cumprimento de obrigações")
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
  @Operation(summary = "Adicionar evidência (arquivo)", description = "Faz upload de um arquivo como evidência de cumprimento")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Arquivo enviado com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = EvidenciaResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content),
      @ApiResponse(responseCode = "400", description = "Arquivo inválido", content = @Content)
  })
  public ResponseEntity<EvidenciaResponseDTO> adicionarArquivo(
      @Parameter(description = "ID da obrigação") @PathVariable Long obrigacaoId,
      @Parameter(description = "Arquivo de evidência") @RequestParam("arquivo") MultipartFile arquivo,
      @Parameter(description = "Descrição da evidência") @RequestParam(required = false) String descricao) {
    logger.info(
        "POST /api/v1/evidencias/obrigacao/{}/arquivo - Upload de arquivo", obrigacaoId);
    EvidenciaResponseDTO response =
        evidenciaService.adicionarEvidenciaArquivo(obrigacaoId, arquivo, descricao);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PostMapping("/obrigacao/{obrigacaoId}/link")
  @Operation(summary = "Adicionar evidência (link)", description = "Adiciona um link externo como evidência de cumprimento")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Link adicionado com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = EvidenciaResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<EvidenciaResponseDTO> adicionarLink(
      @Parameter(description = "ID da obrigação") @PathVariable Long obrigacaoId,
      @Valid @RequestBody EvidenciaCreateDTO dto) {
    logger.info("POST /api/v1/evidencias/obrigacao/{}/link - Adicionar link", obrigacaoId);
    EvidenciaResponseDTO response = evidenciaService.adicionarEvidenciaLink(obrigacaoId, dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PostMapping("/obrigacao/{obrigacaoId}/texto")
  @Operation(summary = "Adicionar evidência (texto)", description = "Adiciona um texto descritivo como evidência de cumprimento")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Texto adicionado com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = EvidenciaResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<EvidenciaResponseDTO> adicionarTexto(
      @Parameter(description = "ID da obrigação") @PathVariable Long obrigacaoId,
      @Valid @RequestBody EvidenciaCreateDTO dto) {
    logger.info("POST /api/v1/evidencias/obrigacao/{}/texto - Adicionar texto", obrigacaoId);
    EvidenciaResponseDTO response = evidenciaService.adicionarEvidenciaTexto(obrigacaoId, dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @GetMapping("/obrigacao/{obrigacaoId}")
  @Operation(summary = "Listar evidências por obrigação", description = "Retorna todas as evidências vinculadas a uma obrigação")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de evidências retornada com sucesso"),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<List<EvidenciaResponseDTO>> listarPorObrigacao(
      @Parameter(description = "ID da obrigação") @PathVariable Long obrigacaoId) {
    logger.debug("GET /api/v1/evidencias/obrigacao/{} - Listar evidências", obrigacaoId);
    List<EvidenciaResponseDTO> response = evidenciaService.listarPorObrigacao(obrigacaoId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}/download")
  @Operation(summary = "Download de arquivo de evidência", description = "Faz download do arquivo de uma evidência")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Arquivo retornado com sucesso"),
      @ApiResponse(responseCode = "404", description = "Evidência não encontrada", content = @Content),
      @ApiResponse(responseCode = "400", description = "Evidência não é do tipo arquivo", content = @Content)
  })
  public ResponseEntity<Resource> downloadArquivo(
      @Parameter(description = "ID da evidência") @PathVariable Long id,
      HttpServletRequest request) {
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
  @Operation(summary = "Excluir evidência", description = "Remove uma evidência (arquivo será deletado se for do tipo arquivo)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Evidência excluída com sucesso"),
      @ApiResponse(responseCode = "404", description = "Evidência não encontrada", content = @Content)
  })
  public ResponseEntity<Void> excluir(
      @Parameter(description = "ID da evidência") @PathVariable Long id) {
    logger.info("DELETE /api/v1/evidencias/{} - Excluir evidência", id);
    evidenciaService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
