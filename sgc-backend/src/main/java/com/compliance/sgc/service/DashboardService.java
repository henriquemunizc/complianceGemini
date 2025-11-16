package com.compliance.sgc.service;

import com.compliance.sgc.domain.enums.StatusObrigacao;
import com.compliance.sgc.dto.dashboard.DashboardResponseDTO;
import com.compliance.sgc.repository.NormaRepository;
import com.compliance.sgc.repository.ObrigacaoRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para fornecer métricas e estatísticas do dashboard.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

  private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

  private final ObrigacaoRepository obrigacaoRepository;
  private final NormaRepository normaRepository;
  private final UsuarioRepository usuarioRepository;

  public DashboardService(
      ObrigacaoRepository obrigacaoRepository,
      NormaRepository normaRepository,
      UsuarioRepository usuarioRepository) {
    this.obrigacaoRepository = obrigacaoRepository;
    this.normaRepository = normaRepository;
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * Obtém as métricas do dashboard.
   * Todos os usuários autenticados podem acessar.
   *
   * @return DashboardResponseDTO com as métricas
   */
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public DashboardResponseDTO obterMetricas() {
    logger.debug("Obtendo métricas do dashboard");

    // Total de obrigações ativas
    Long totalObrigacoes = obrigacaoRepository.countByAtivo(true);

    // Obrigações por status (apenas ativas)
    Long obrigacoesPendentes = contarPorStatus(StatusObrigacao.PENDENTE);
    Long obrigacoesEmAnalise = contarPorStatus(StatusObrigacao.EM_ANALISE);
    Long obrigacoesAprovadas = contarPorStatus(StatusObrigacao.APROVADO);
    Long obrigacoesReprovadas = contarPorStatus(StatusObrigacao.REPROVADO);

    // Obrigações atrasadas
    Long obrigacoesAtrasadas =
        Long.valueOf(obrigacaoRepository.findObrigacoesAtrasadas(LocalDate.now()).size());

    // Total de normas ativas
    Long totalNormas = normaRepository.countByAtivo(true);

    // Normas vigentes
    Long normasVigentes = Long.valueOf(normaRepository.findNormasVigentes(LocalDate.now()).size());

    // Usuários ativos
    Long totalUsuariosAtivos = usuarioRepository.countByAtivo(true);

    // Mapa de obrigações por status
    Map<StatusObrigacao, Long> obrigacoesPorStatus = new HashMap<>();
    Arrays.stream(StatusObrigacao.values())
        .forEach(status -> obrigacoesPorStatus.put(status, contarPorStatus(status)));

    logger.debug(
        "Métricas calculadas: {} obrigações, {} normas, {} usuários",
        totalObrigacoes,
        totalNormas,
        totalUsuariosAtivos);

    return new DashboardResponseDTO(
        totalObrigacoes,
        obrigacoesPendentes,
        obrigacoesEmAnalise,
        obrigacoesAprovadas,
        obrigacoesReprovadas,
        obrigacoesAtrasadas,
        totalNormas,
        normasVigentes,
        totalUsuariosAtivos,
        obrigacoesPorStatus);
  }

  /**
   * Conta obrigações por status (apenas ativas).
   *
   * @param status Status da obrigação
   * @return Quantidade de obrigações
   */
  private Long contarPorStatus(StatusObrigacao status) {
    return Long.valueOf(obrigacaoRepository.findByStatusAndAtivo(status, true).size());
  }
}
