package com.compliance.sgc.domain.enums;

/**
 * Status de uma obrigação de compliance.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public enum StatusObrigacao {
  /**
   * Obrigação criada, aguardando evidências.
   */
  PENDENTE,

  /**
   * Evidências submetidas, aguardando análise do Compliance.
   */
  EM_ANALISE,

  /**
   * Obrigação aprovada pelo Compliance.
   */
  APROVADO,

  /**
   * Obrigação reprovada, precisa de correções.
   */
  REPROVADO,

  /**
   * Prazo de execução vencido e status ainda PENDENTE.
   */
  ATRASADO
}
