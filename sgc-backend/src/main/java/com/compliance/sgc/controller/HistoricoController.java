package com.compliance.sgc.controller;

import com.compliance.sgc.dto.historico.HistoricoResponseDTO;
import com.compliance.sgc.service.HistoricoService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/historico")
public class HistoricoController {

  private static final Logger logger = LoggerFactory.getLogger(HistoricoController.class);

  private final HistoricoService historicoService;

  public HistoricoController(HistoricoService historicoService) {
    this.historicoService = historicoService;
  }

  @GetMapping("/obrigacao/{obrigacaoId}")
  public ResponseEntity<List<HistoricoResponseDTO>> listarPorObrigacao(
      @PathVariable Long obrigacaoId) {
    logger.debug("GET /api/v1/historico/obrigacao/{} - Listar histórico", obrigacaoId);
    List<HistoricoResponseDTO> response = historicoService.listarPorObrigacao(obrigacaoId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<HistoricoResponseDTO> buscarPorId(@PathVariable Long id) {
    logger.debug("GET /api/v1/historico/{} - Buscar por ID", id);
    HistoricoResponseDTO response = historicoService.buscarPorId(id);
    return ResponseEntity.ok(response);
  }
}
