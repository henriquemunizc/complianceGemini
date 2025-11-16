package com.compliance.sgc.controller;

import com.compliance.sgc.dto.dashboard.DashboardResponseDTO;
import com.compliance.sgc.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST para dashboard com métricas e estatísticas.
 * Endpoint: /api/v1/dashboard
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

  private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

  private final DashboardService dashboardService;

  public DashboardController(DashboardService dashboardService) {
    this.dashboardService = dashboardService;
  }

  /**
   * Obtém as métricas do dashboard.
   * Todos os usuários autenticados podem acessar.
   *
   * @return DashboardResponseDTO com as métricas
   */
  @GetMapping
  public ResponseEntity<DashboardResponseDTO> obterMetricas() {
    logger.debug("GET /api/v1/dashboard - Obter métricas");
    DashboardResponseDTO response = dashboardService.obterMetricas();
    return ResponseEntity.ok(response);
  }
}
