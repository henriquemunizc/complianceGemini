package com.compliance.sgc.dto.dashboard;

import com.compliance.sgc.domain.enums.StatusObrigacao;
import java.util.Map;

/**
 * DTO de resposta do Dashboard com métricas e estatísticas do sistema.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record DashboardResponseDTO(
    Long totalObrigacoes,
    Long obrigacoesPendentes,
    Long obrigacoesEmAnalise,
    Long obrigacoesAprovadas,
    Long obrigacoesReprovadas,
    Long obrigacoesAtrasadas,
    Long totalNormas,
    Long normasVigentes,
    Long totalUsuariosAtivos,
    Map<StatusObrigacao, Long> obrigacoesPorStatus) {}
