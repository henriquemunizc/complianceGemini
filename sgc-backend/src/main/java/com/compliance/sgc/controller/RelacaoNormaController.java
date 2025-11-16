package com.compliance.sgc.controller;

import com.compliance.sgc.dto.relacao.RelacaoNormaCreateDTO;
import com.compliance.sgc.dto.relacao.RelacaoNormaResponseDTO;
import com.compliance.sgc.service.RelacaoNormaService;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST para gerenciamento de relações entre normas.
 * Endpoints: /api/v1/relacoes-normas
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/relacoes-normas")
public class RelacaoNormaController {

  private static final Logger logger = LoggerFactory.getLogger(RelacaoNormaController.class);

  private final RelacaoNormaService relacaoNormaService;

  public RelacaoNormaController(RelacaoNormaService relacaoNormaService) {
    this.relacaoNormaService = relacaoNormaService;
  }

  /**
   * Cria uma relação entre duas normas.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param dto Dados da relação
   * @return RelacaoNormaResponseDTO com status 201 (CREATED)
   */
  @PostMapping
  public ResponseEntity<RelacaoNormaResponseDTO> criar(
      @Valid @RequestBody RelacaoNormaCreateDTO dto) {
    logger.info(
        "POST /api/v1/relacoes-normas - Criar relação: {} -> {} ({})",
        dto.normaOrigemId(),
        dto.normaDestinoId(),
        dto.tipoRelacao());
    RelacaoNormaResponseDTO response = relacaoNormaService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  /**
   * Busca todas as relações de uma norma.
   * Todos os usuários autenticados podem acessar.
   *
   * @param normaId ID da norma
   * @return Lista de RelacaoNormaResponseDTO
   */
  @GetMapping("/norma/{normaId}")
  public ResponseEntity<List<RelacaoNormaResponseDTO>> buscarPorNorma(@PathVariable Long normaId) {
    logger.debug("GET /api/v1/relacoes-normas/norma/{} - Buscar relações por norma", normaId);
    List<RelacaoNormaResponseDTO> response = relacaoNormaService.buscarPorNorma(normaId);
    return ResponseEntity.ok(response);
  }

  /**
   * Exclui uma relação entre normas.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param id ID da relação
   * @return Status 204 (NO CONTENT)
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/relacoes-normas/{} - Excluir relação", id);
    relacaoNormaService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
