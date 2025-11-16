package com.compliance.sgc.controller;

import com.compliance.sgc.domain.enums.StatusObrigacao;
import com.compliance.sgc.dto.obrigacao.*;
import com.compliance.sgc.service.ObrigacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/obrigacoes")
@Tag(name = "Obrigações", description = "Endpoints para gerenciamento de obrigações de compliance")
public class ObrigacaoController {

  private static final Logger logger = LoggerFactory.getLogger(ObrigacaoController.class);

  private final ObrigacaoService obrigacaoService;

  public ObrigacaoController(ObrigacaoService obrigacaoService) {
    this.obrigacaoService = obrigacaoService;
  }

  @PostMapping
  @Operation(summary = "Criar nova obrigação", description = "Cria uma nova obrigação de compliance vinculada a normas regulatórias")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Obrigação criada com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObrigacaoResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
      @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
  })
  public ResponseEntity<ObrigacaoResponseDTO> criar(@Valid @RequestBody ObrigacaoCreateDTO dto) {
    logger.info("POST /api/v1/obrigacoes - Criar obrigação: {}", dto.titulo());
    ObrigacaoResponseDTO response = obrigacaoService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Atualizar obrigação", description = "Atualiza os dados de uma obrigação existente")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Obrigação atualizada com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObrigacaoResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content),
      @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
  })
  public ResponseEntity<ObrigacaoResponseDTO> atualizar(
      @Parameter(description = "ID da obrigação") @PathVariable Long id,
      @Valid @RequestBody ObrigacaoUpdateDTO dto) {
    logger.info("PUT /api/v1/obrigacoes/{} - Atualizar obrigação", id);
    ObrigacaoResponseDTO response = obrigacaoService.atualizar(id, dto);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{id}/submeter")
  @Operation(summary = "Submeter obrigação para aprovação", description = "Submete uma obrigação para o fluxo de aprovação")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Obrigação submetida com sucesso"),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<ObrigacaoResponseDTO> submeter(
      @Parameter(description = "ID da obrigação") @PathVariable Long id) {
    logger.info("POST /api/v1/obrigacoes/{}/submeter - Submeter para aprovação", id);
    ObrigacaoResponseDTO response = obrigacaoService.submeter(id);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{id}/aprovar")
  @Operation(summary = "Aprovar obrigação", description = "Aprova uma obrigação submetida")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Obrigação aprovada com sucesso"),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<ObrigacaoResponseDTO> aprovar(
      @Parameter(description = "ID da obrigação") @PathVariable Long id,
      @Valid @RequestBody AprovarObrigacaoDTO dto) {
    logger.info("POST /api/v1/obrigacoes/{}/aprovar - Aprovar obrigação", id);
    ObrigacaoResponseDTO response = obrigacaoService.aprovar(id, dto.motivoAprovacao());
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{id}/rejeitar")
  @Operation(summary = "Rejeitar obrigação", description = "Rejeita uma obrigação submetida com motivo")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Obrigação rejeitada com sucesso"),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<ObrigacaoResponseDTO> rejeitar(
      @Parameter(description = "ID da obrigação") @PathVariable Long id,
      @Valid @RequestBody RejeitarObrigacaoDTO dto) {
    logger.info("POST /api/v1/obrigacoes/{}/rejeitar - Rejeitar obrigação", id);
    ObrigacaoResponseDTO response = obrigacaoService.rejeitar(id, dto.motivoRejeicao());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Buscar obrigação por ID", description = "Retorna os detalhes de uma obrigação específica")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Obrigação encontrada",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObrigacaoResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<ObrigacaoResponseDTO> buscarPorId(
      @Parameter(description = "ID da obrigação") @PathVariable Long id) {
    logger.debug("GET /api/v1/obrigacoes/{} - Buscar por ID", id);
    ObrigacaoResponseDTO response = obrigacaoService.buscarPorId(id);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  @Operation(summary = "Listar obrigações", description = "Lista obrigações com filtros e paginação")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
  })
  public ResponseEntity<Page<ObrigacaoResponseDTO>> listar(
      @Parameter(description = "Filtrar por status") @RequestParam(required = false) StatusObrigacao status,
      @Parameter(description = "Filtrar por responsável") @RequestParam(required = false) Long responsavelId,
      @Parameter(description = "Filtrar atrasadas") @RequestParam(required = false) Boolean atrasada,
      @PageableDefault(size = 20, sort = "prazoExecucao", direction = Sort.Direction.ASC)
          Pageable pageable) {
    logger.debug("GET /api/v1/obrigacoes - Listar com filtros");
    Page<ObrigacaoResponseDTO> response =
        obrigacaoService.listar(status, responsavelId, atrasada, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/atrasadas")
  @Operation(summary = "Buscar obrigações atrasadas", description = "Retorna todas as obrigações com prazo vencido")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de obrigações atrasadas")
  })
  public ResponseEntity<List<ObrigacaoResponseDTO>> buscarAtrasadas() {
    logger.debug("GET /api/v1/obrigacoes/atrasadas - Buscar atrasadas");
    List<ObrigacaoResponseDTO> response = obrigacaoService.buscarAtrasadas();
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Excluir obrigação", description = "Realiza exclusão lógica (soft delete) de uma obrigação")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Obrigação excluída com sucesso"),
      @ApiResponse(responseCode = "404", description = "Obrigação não encontrada", content = @Content)
  })
  public ResponseEntity<Void> excluir(
      @Parameter(description = "ID da obrigação") @PathVariable Long id) {
    logger.info("DELETE /api/v1/obrigacoes/{} - Excluir (soft delete)", id);
    obrigacaoService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
