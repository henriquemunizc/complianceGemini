package com.compliance.sgc.controller;

import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.exception.ErrorResponse;
import com.compliance.sgc.exception.UnauthorizedException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleEntityNotFound(
      EntityNotFoundException ex, WebRequest request) {
    logger.warn("Entidade não encontrada: {}", ex.getMessage());

    ErrorResponse error =
        new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.NOT_FOUND.value(),
            "Recurso não encontrado",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(BusinessValidationException.class)
  public ResponseEntity<ErrorResponse> handleBusinessValidation(
      BusinessValidationException ex, WebRequest request) {
    logger.warn("Erro de validação de negócio: {}", ex.getMessage());

    ErrorResponse error =
        new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Erro de validação",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ErrorResponse> handleUnauthorized(
      UnauthorizedException ex, WebRequest request) {
    logger.warn("Acesso não autorizado: {}", ex.getMessage());

    ErrorResponse error =
        new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.FORBIDDEN.value(),
            "Acesso negado",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(
      AccessDeniedException ex, WebRequest request) {
    logger.warn("Acesso negado pelo Spring Security: {}", ex.getMessage());

    ErrorResponse error =
        new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.FORBIDDEN.value(),
            "Acesso negado",
            "Você não tem permissão para acessar este recurso",
            request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuthentication(
      AuthenticationException ex, WebRequest request) {
    logger.warn("Erro de autenticação: {}", ex.getMessage());

    ErrorResponse error =
        new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.UNAUTHORIZED.value(),
            "Autenticação necessária",
            "Credenciais inválidas ou ausentes",
            request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidationErrors(
      MethodArgumentNotValidException ex, WebRequest request) {
    logger.warn("Erro de validação de entrada: {}", ex.getMessage());

    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getAllErrors()
        .forEach(
            (error) -> {
              String fieldName = ((FieldError) error).getField();
              String errorMessage = error.getDefaultMessage();
              errors.put(fieldName, errorMessage);
            });

    Map<String, Object> response = new HashMap<>();
    response.put("timestamp", LocalDateTime.now());
    response.put("status", HttpStatus.BAD_REQUEST.value());
    response.put("error", "Erro de validação");
    response.put("message", "Campos inválidos");
    response.put("errors", errors);
    response.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
      MaxUploadSizeExceededException ex, WebRequest request) {
    logger.warn("Tamanho máximo de upload excedido: {}", ex.getMessage());

    ErrorResponse error =
        new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.PAYLOAD_TOO_LARGE.value(),
            "Arquivo muito grande",
            "O arquivo excede o tamanho máximo permitido",
            request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(error, HttpStatus.PAYLOAD_TOO_LARGE);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
    logger.error("Erro não tratado: {}", ex.getMessage(), ex);

    // IMPORTANTE: Não expor detalhes internos em produção (OWASP A04: Information Exposure)
    ErrorResponse error =
        new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Erro interno do servidor",
            "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
            request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
