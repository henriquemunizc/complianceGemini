package com.compliance.sgc.security;

import com.compliance.sgc.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * Entry point de autenticação JWT.
 * Retorna erro padronizado (ErrorResponse) quando autenticação falha.
 * Proteção OWASP: Broken Authentication.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationEntryPoint.class);

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException
  ) throws IOException, ServletException {
    logger.error("Acesso não autorizado: {}", authException.getMessage());

    ErrorResponse errorResponse = new ErrorResponse(
        LocalDateTime.now(),
        HttpServletResponse.SC_UNAUTHORIZED,
        "Unauthorized",
        "Acesso não autorizado. Token JWT inválido ou ausente.",
        request.getRequestURI()
    );

    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

    ObjectMapper mapper = new ObjectMapper();
    mapper.findAndRegisterModules(); // Suporte para LocalDateTime
    mapper.writeValue(response.getOutputStream(), errorResponse);
  }
}
