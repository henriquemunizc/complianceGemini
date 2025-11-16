package com.compliance.sgc.domain.enums;

/**
 * Enum TipoNotificacao - Tipos de notificações do sistema.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public enum TipoNotificacao {
  /**
   * Obrigação com prazo vencido.
   */
  OBRIGACAO_ATRASADA,

  /**
   * Obrigação foi submetida para aprovação.
   */
  OBRIGACAO_SUBMETIDA,

  /**
   * Obrigação foi aprovada.
   */
  OBRIGACAO_APROVADA,

  /**
   * Obrigação foi rejeitada.
   */
  OBRIGACAO_REJEITADA,

  /**
   * Nova evidência foi anexada.
   */
  NOVA_EVIDENCIA,

  /**
   * Usuário foi mencionado em um comentário.
   */
  COMENTARIO_MENCIONOU,

  /**
   * Prazo da obrigação está próximo (3 dias antes).
   */
  PRAZO_PROXIMO
}
