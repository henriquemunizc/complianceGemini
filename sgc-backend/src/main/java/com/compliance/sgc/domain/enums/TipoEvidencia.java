package com.compliance.sgc.domain.enums;

/**
 * Tipo de evidência de cumprimento de obrigação.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public enum TipoEvidencia {
  /**
   * Arquivo anexado (PDF, DOCX, XLSX, imagem, etc.).
   */
  ARQUIVO,

  /**
   * Link externo (URL).
   */
  LINK,

  /**
   * Texto rico (HTML/Markdown).
   */
  TEXTO
}
