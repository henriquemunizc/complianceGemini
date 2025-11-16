package com.compliance.sgc.controller;

import com.compliance.sgc.dto.norma.NormaCreateDTO;
import com.compliance.sgc.dto.norma.NormaResponseDTO;
import com.compliance.sgc.dto.norma.NormaUpdateDTO;
import com.compliance.sgc.service.NormaService;
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
@RequestMapping("/api/v1/normas")
@Tag(name = "Normas", description = "Endpoints para gerenciamento de normas regulatórias")
public class NormaController {

  private static final Logger logger = LoggerFactory.getLogger(NormaController.class);

  private final NormaService normaService;

  public NormaController(NormaService normaService) {
    this.normaService = normaService;
  }

  @PostMapping
  @Operation(summary = "Criar nova norma", description = "Cadastra uma nova norma regulatória (lei, decreto, resolução, etc.)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Norma criada com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = NormaResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
      @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
  })
  public ResponseEntity<NormaResponseDTO> criar(@Valid @RequestBody NormaCreateDTO dto) {
    logger.info("POST /api/v1/normas - Criar norma: {} {}/{}", dto.tipoNorma(), dto.numero(), dto.ano());
    NormaResponseDTO response = normaService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Atualizar norma", description = "Atualiza os dados de uma norma existente")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Norma atualizada com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = NormaResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Norma não encontrada", content = @Content),
      @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
  })
  public ResponseEntity<NormaResponseDTO> atualizar(
      @Parameter(description = "ID da norma") @PathVariable Long id,
      @Valid @RequestBody NormaUpdateDTO dto) {
    logger.info("PUT /api/v1/normas/{} - Atualizar norma", id);
    NormaResponseDTO response = normaService.atualizar(id, dto);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Buscar norma por ID", description = "Retorna os detalhes de uma norma específica")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Norma encontrada",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = NormaResponseDTO.class))),
      @ApiResponse(responseCode = "404", description = "Norma não encontrada", content = @Content)
  })
  public ResponseEntity<NormaResponseDTO> buscarPorId(
      @Parameter(description = "ID da norma") @PathVariable Long id) {
    logger.debug("GET /api/v1/normas/{} - Buscar por ID", id);
    NormaResponseDTO response = normaService.buscarPorId(id);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  @Operation(summary = "Listar normas", description = "Lista normas com filtros e paginação")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
  })
  public ResponseEntity<Page<NormaResponseDTO>> listar(
      @Parameter(description = "Filtrar por tipo de norma") @RequestParam(required = false) String tipo,
      @Parameter(description = "Filtrar por ano") @RequestParam(required = false) Integer ano,
      @Parameter(description = "Filtrar apenas vigentes") @RequestParam(required = false) Boolean vigente,
      @PageableDefault(size = 20, sort = "dataPublicacao", direction = Sort.Direction.DESC)
          Pageable pageable) {
    logger.debug("GET /api/v1/normas - Listar com filtros");
    Page<NormaResponseDTO> response = normaService.listar(tipo, ano, vigente, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/vigentes")
  @Operation(summary = "Buscar normas vigentes", description = "Retorna todas as normas atualmente vigentes")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de normas vigentes")
  })
  public ResponseEntity<List<NormaResponseDTO>> buscarVigentes() {
    logger.debug("GET /api/v1/normas/vigentes - Buscar normas vigentes");
    List<NormaResponseDTO> response = normaService.buscarNormasVigentes();
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Excluir norma", description = "Realiza exclusão lógica (soft delete) de uma norma")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Norma excluída com sucesso"),
      @ApiResponse(responseCode = "404", description = "Norma não encontrada", content = @Content)
  })
  public ResponseEntity<Void> excluir(
      @Parameter(description = "ID da norma") @PathVariable Long id) {
    logger.info("DELETE /api/v1/normas/{} - Excluir (soft delete)", id);
    normaService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
