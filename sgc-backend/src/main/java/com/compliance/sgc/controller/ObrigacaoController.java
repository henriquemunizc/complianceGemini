package com.compliance.sgc.controller;

import com.compliance.sgc.domain.enums.StatusObrigacao;
import com.compliance.sgc.dto.obrigacao.*;
import com.compliance.sgc.service.ObrigacaoService;
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
public class ObrigacaoController {

  private static final Logger logger = LoggerFactory.getLogger(ObrigacaoController.class);

  private final ObrigacaoService obrigacaoService;

  public ObrigacaoController(ObrigacaoService obrigacaoService) {
    this.obrigacaoService = obrigacaoService;
  }

  @PostMapping
  public ResponseEntity<ObrigacaoResponseDTO> criar(@Valid @RequestBody ObrigacaoCreateDTO dto) {
    logger.info("POST /api/v1/obrigacoes - Criar obrigação: {}", dto.titulo());
    ObrigacaoResponseDTO response = obrigacaoService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<ObrigacaoResponseDTO> atualizar(
      @PathVariable Long id, @Valid @RequestBody ObrigacaoUpdateDTO dto) {
    logger.info("PUT /api/v1/obrigacoes/{} - Atualizar obrigação", id);
    ObrigacaoResponseDTO response = obrigacaoService.atualizar(id, dto);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{id}/submeter")
  public ResponseEntity<ObrigacaoResponseDTO> submeter(@PathVariable Long id) {
    logger.info("POST /api/v1/obrigacoes/{}/submeter - Submeter para aprovação", id);
    ObrigacaoResponseDTO response = obrigacaoService.submeter(id);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{id}/aprovar")
  public ResponseEntity<ObrigacaoResponseDTO> aprovar(
      @PathVariable Long id, @Valid @RequestBody AprovarObrigacaoDTO dto) {
    logger.info("POST /api/v1/obrigacoes/{}/aprovar - Aprovar obrigação", id);
    ObrigacaoResponseDTO response = obrigacaoService.aprovar(id, dto.motivoAprovacao());
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{id}/rejeitar")
  public ResponseEntity<ObrigacaoResponseDTO> rejeitar(
      @PathVariable Long id, @Valid @RequestBody RejeitarObrigacaoDTO dto) {
    logger.info("POST /api/v1/obrigacoes/{}/rejeitar - Rejeitar obrigação", id);
    ObrigacaoResponseDTO response = obrigacaoService.rejeitar(id, dto.motivoRejeicao());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<ObrigacaoResponseDTO> buscarPorId(@PathVariable Long id) {
    logger.debug("GET /api/v1/obrigacoes/{} - Buscar por ID", id);
    ObrigacaoResponseDTO response = obrigacaoService.buscarPorId(id);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  public ResponseEntity<Page<ObrigacaoResponseDTO>> listar(
      @RequestParam(required = false) StatusObrigacao status,
      @RequestParam(required = false) Long responsavelId,
      @RequestParam(required = false) Boolean atrasada,
      @PageableDefault(size = 20, sort = "prazoExecucao", direction = Sort.Direction.ASC)
          Pageable pageable) {
    logger.debug("GET /api/v1/obrigacoes - Listar com filtros");
    Page<ObrigacaoResponseDTO> response =
        obrigacaoService.listar(status, responsavelId, atrasada, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/atrasadas")
  public ResponseEntity<List<ObrigacaoResponseDTO>> buscarAtrasadas() {
    logger.debug("GET /api/v1/obrigacoes/atrasadas - Buscar atrasadas");
    List<ObrigacaoResponseDTO> response = obrigacaoService.buscarAtrasadas();
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/obrigacoes/{} - Excluir (soft delete)", id);
    obrigacaoService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
