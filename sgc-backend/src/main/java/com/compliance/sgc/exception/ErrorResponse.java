package com.compliance.sgc.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Estrutura padronizada de resposta de erro da API.
 *
 * @param timestamp Data/hora do erro
 * @param status Código HTTP do status
 * @param error Nome do erro (ex: "Bad Request")
 * @param message Mensagem descritiva do erro
 * @param path Path da requisição que gerou o erro
 * @param validationErrors Erros de validação de campos (opcional)
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> validationErrors
) {
  /**
   * Construtor simplificado sem erros de validação.
   */
  public ErrorResponse(LocalDateTime timestamp, int status, String error,
                       String message, String path) {
    this(timestamp, status, error, message, path, null);
  }
}
