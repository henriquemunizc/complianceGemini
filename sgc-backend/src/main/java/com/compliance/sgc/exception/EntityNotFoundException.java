package com.compliance.sgc.exception;

/**
 * Exceção lançada quando uma entidade não é encontrada no banco de dados.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public class EntityNotFoundException extends RuntimeException {

  public EntityNotFoundException(String message) {
    super(message);
  }

  public EntityNotFoundException(String entityName, Long id) {
    super(String.format("%s com ID %d não encontrado(a)", entityName, id));
  }

  public EntityNotFoundException(String entityName, String field, Object value) {
    super(String.format("%s com %s='%s' não encontrado(a)", entityName, field, value));
  }
}
