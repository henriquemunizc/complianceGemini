package com.compliance.sgc.controller;

import com.compliance.sgc.dto.notificacao.NotificacaoCreateDTO;
import com.compliance.sgc.dto.notificacao.NotificacaoResponseDTO;
import com.compliance.sgc.service.NotificacaoService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para gerenciamento de notificações.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/notificacoes")
@Tag(name = "Notificações", description = "Endpoints para gerenciamento de notificações do sistema")
public class NotificacaoController {

  private static final Logger logger = LoggerFactory.getLogger(NotificacaoController.class);

  private final NotificacaoService notificacaoService;

  public NotificacaoController(NotificacaoService notificacaoService) {
    this.notificacaoService = notificacaoService;
  }

  @PostMapping
  @Operation(
      summary = "Criar notificação",
      description = "Cria uma nova notificação para um usuário")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Notificação criada com sucesso",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = NotificacaoResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<NotificacaoResponseDTO> criar(@Valid @RequestBody NotificacaoCreateDTO dto) {
    logger.info("POST /api/v1/notificacoes - Criar notificação para usuário: {}", dto.usuarioId());
    NotificacaoResponseDTO response = notificacaoService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @GetMapping
  @Operation(
      summary = "Listar minhas notificações",
      description = "Lista todas as notificações do usuário logado")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<List<NotificacaoResponseDTO>> listarMinhas() {
    logger.debug("GET /api/v1/notificacoes - Listar minhas notificações");
    List<NotificacaoResponseDTO> response = notificacaoService.listarMinhasNotificacoes();
    return ResponseEntity.ok(response);
  }

  @GetMapping("/nao-lidas")
  @Operation(
      summary = "Listar notificações não lidas",
      description = "Lista notificações não lidas do usuário logado")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<List<NotificacaoResponseDTO>> listarNaoLidas() {
    logger.debug("GET /api/v1/notificacoes/nao-lidas - Listar não lidas");
    List<NotificacaoResponseDTO> response = notificacaoService.listarNaoLidas();
    return ResponseEntity.ok(response);
  }

  @GetMapping("/nao-lidas/count")
  @Operation(
      summary = "Contar notificações não lidas",
      description = "Retorna o contador de notificações não lidas")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Contador retornado com sucesso"),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<Long> contarNaoLidas() {
    logger.debug("GET /api/v1/notificacoes/nao-lidas/count - Contar não lidas");
    Long count = notificacaoService.contarNaoLidas();
    return ResponseEntity.ok(count);
  }

  @PutMapping("/{id}/marcar-lida")
  @Operation(
      summary = "Marcar notificação como lida",
      description = "Marca uma notificação específica como lida")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Notificação marcada como lida"),
        @ApiResponse(
            responseCode = "404",
            description = "Notificação não encontrada",
            content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<Void> marcarComoLida(
      @Parameter(description = "ID da notificação") @PathVariable Long id) {
    logger.info("PUT /api/v1/notificacoes/{}/marcar-lida - Marcar como lida", id);
    notificacaoService.marcarComoLida(id);
    return ResponseEntity.ok().build();
  }

  @PutMapping("/marcar-todas-lidas")
  @Operation(
      summary = "Marcar todas como lidas",
      description = "Marca todas as notificações do usuário logado como lidas")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Todas marcadas como lidas"),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<Void> marcarTodasLidas() {
    logger.info("PUT /api/v1/notificacoes/marcar-todas-lidas - Marcar todas como lidas");
    notificacaoService.marcarTodasComoLidas();
    return ResponseEntity.ok().build();
  }
}
