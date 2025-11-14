package com.compliance.sgc.exception;

/**
 * Exceção lançada quando uma regra de negócio é violada.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public class BusinessValidationException extends RuntimeException {

  public BusinessValidationException(String message) {
    super(message);
  }

  public BusinessValidationException(String message, Throwable cause) {
    super(message, cause);
  }
}
