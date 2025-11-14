package com.compliance.sgc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuração de CORS (Cross-Origin Resource Sharing).
 * Permite que o frontend Angular (localhost:4200 em dev) acesse a API.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

  @Value("${cors.allowed-origins}")
  private String allowedOrigins;

  @Value("${cors.allowed-methods}")
  private String allowedMethods;

  @Value("${cors.allowed-headers}")
  private String allowedHeaders;

  @Value("${cors.allow-credentials}")
  private boolean allowCredentials;

  @Value("${cors.max-age}")
  private long maxAge;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins(allowedOrigins.split(","))
        .allowedMethods(allowedMethods.split(","))
        .allowedHeaders(allowedHeaders.split(","))
        .allowCredentials(allowCredentials)
        .maxAge(maxAge);
  }
}
