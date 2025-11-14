package com.compliance.sgc.exception;

/**
 * Exceção lançada quando um usuário não tem permissão para acessar um recurso.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public class UnauthorizedException extends RuntimeException {

  public UnauthorizedException(String message) {
    super(message);
  }
}
