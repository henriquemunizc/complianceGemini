package com.compliance.sgc.controller;

import com.compliance.sgc.dto.comentario.ComentarioCreateDTO;
import com.compliance.sgc.dto.comentario.ComentarioResponseDTO;
import com.compliance.sgc.dto.comentario.ComentarioUpdateDTO;
import com.compliance.sgc.service.ComentarioService;
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
 * Controller para gerenciamento de comentários.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/comentarios")
@Tag(name = "Comentários", description = "Endpoints para gerenciamento de comentários em obrigações")
public class ComentarioController {

  private static final Logger logger = LoggerFactory.getLogger(ComentarioController.class);

  private final ComentarioService comentarioService;

  public ComentarioController(ComentarioService comentarioService) {
    this.comentarioService = comentarioService;
  }

  @PostMapping
  @Operation(
      summary = "Criar comentário",
      description = "Cria um novo comentário em uma obrigação")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Comentário criado com sucesso",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ComentarioResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<ComentarioResponseDTO> criar(@Valid @RequestBody ComentarioCreateDTO dto) {
    logger.info("POST /api/v1/comentarios - Criar comentário na obrigação: {}", dto.obrigacaoId());
    ComentarioResponseDTO response = comentarioService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @GetMapping("/obrigacao/{obrigacaoId}")
  @Operation(
      summary = "Listar comentários de uma obrigação",
      description = "Lista todos os comentários de uma obrigação específica")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
        @ApiResponse(
            responseCode = "404",
            description = "Obrigação não encontrada",
            content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<List<ComentarioResponseDTO>> listarPorObrigacao(
      @Parameter(description = "ID da obrigação") @PathVariable Long obrigacaoId) {
    logger.debug("GET /api/v1/comentarios/obrigacao/{} - Listar comentários", obrigacaoId);
    List<ComentarioResponseDTO> response = comentarioService.listarPorObrigacao(obrigacaoId);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  @Operation(
      summary = "Atualizar comentário",
      description = "Atualiza o conteúdo de um comentário (apenas autor)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Comentário atualizado com sucesso",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ComentarioResponseDTO.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Comentário não encontrado",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Apenas o autor pode editar",
            content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<ComentarioResponseDTO> atualizar(
      @Parameter(description = "ID do comentário") @PathVariable Long id,
      @Valid @RequestBody ComentarioUpdateDTO dto) {
    logger.info("PUT /api/v1/comentarios/{} - Atualizar comentário", id);
    ComentarioResponseDTO response = comentarioService.atualizar(id, dto);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(
      summary = "Excluir comentário",
      description = "Exclui um comentário (apenas autor)")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Comentário excluído com sucesso"),
        @ApiResponse(
            responseCode = "404",
            description = "Comentário não encontrado",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Apenas o autor pode excluir",
            content = @Content),
        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
      })
  public ResponseEntity<Void> excluir(
      @Parameter(description = "ID do comentário") @PathVariable Long id) {
    logger.info("DELETE /api/v1/comentarios/{} - Excluir comentário", id);
    comentarioService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
