package com.compliance.sgc.controller;

import com.compliance.sgc.dto.audit.AuditLogResponseDTO;
import com.compliance.sgc.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para acesso aos logs de auditoria.
 * Apenas usuários ADMIN podem acessar.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Auditoria", description = "Endpoints para consulta de logs de auditoria (apenas ADMIN)")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

  private static final Logger logger = LoggerFactory.getLogger(AuditController.class);

  private final AuditLogService auditLogService;

  public AuditController(AuditLogService auditLogService) {
    this.auditLogService = auditLogService;
  }

  @GetMapping("/{entidade}/{entidadeId}")
  @Operation(
      summary = "Buscar histórico de uma entidade",
      description = "Retorna todos os logs de auditoria de uma entidade específica (apenas ADMIN)")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado", content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<List<AuditLogResponseDTO>> buscarPorEntidade(
      @Parameter(description = "Nome da entidade (ex: Obrigacao, Usuario)") @PathVariable
          String entidade,
      @Parameter(description = "ID da entidade") @PathVariable Long entidadeId) {
    logger.debug("GET /api/v1/audit/{}/{} - Buscar histórico", entidade, entidadeId);
    List<AuditLogResponseDTO> response = auditLogService.buscarPorEntidade(entidade, entidadeId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/usuario/{email}")
  @Operation(
      summary = "Buscar ações de um usuário",
      description = "Retorna todos os logs de auditoria de um usuário (apenas ADMIN)")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado", content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<List<AuditLogResponseDTO>> buscarPorUsuario(
      @Parameter(description = "Email do usuário") @PathVariable String email) {
    logger.debug("GET /api/v1/audit/usuario/{} - Buscar histórico do usuário", email);
    List<AuditLogResponseDTO> response = auditLogService.buscarPorUsuario(email);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/periodo")
  @Operation(
      summary = "Buscar logs por período",
      description = "Retorna logs de auditoria em um período específico (apenas ADMIN)")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Logs retornados com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado", content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<List<AuditLogResponseDTO>> buscarPorPeriodo(
      @Parameter(description = "Data/hora inicial") @RequestParam
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime inicio,
      @Parameter(description = "Data/hora final") @RequestParam
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime fim) {
    logger.debug("GET /api/v1/audit/periodo - Buscar entre {} e {}", inicio, fim);
    List<AuditLogResponseDTO> response = auditLogService.buscarPorPeriodo(inicio, fim);
    return ResponseEntity.ok(response);
  }
}
