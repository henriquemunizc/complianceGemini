package com.compliance.sgc.domain.enums;

/**
 * Perfil (role) de um usuário no sistema.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public enum PerfilUsuario {
  /**
   * Administrador do sistema (acesso total).
   */
  ADMIN,

  /**
   * Área de Compliance (aprova/reprova obrigações).
   */
  COMPLIANCE,

  /**
   * Responsável por obrigações (cria evidências, submete para análise).
   */
  RESPONSAVEL,

  /**
   * Apenas visualização (read-only).
   */
  VISUALIZADOR
}
