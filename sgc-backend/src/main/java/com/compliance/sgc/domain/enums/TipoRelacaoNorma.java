package com.compliance.sgc.domain.enums;

/**
 * Tipo de relacionamento entre normas.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public enum TipoRelacaoNorma {
  /**
   * Norma A regulamenta Norma B.
   */
  REGULAMENTA,

  /**
   * Norma A revoga Norma B.
   */
  REVOGA,

  /**
   * Norma A altera Norma B.
   */
  ALTERA,

  /**
   * Norma A complementa Norma B.
   */
  COMPLEMENTA,

  /**
   * Norma A referencia Norma B.
   */
  REFERENCIA
}
