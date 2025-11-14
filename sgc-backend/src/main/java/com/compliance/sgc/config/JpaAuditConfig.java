package com.compliance.sgc.config;

import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Configuração de auditoria JPA.
 * Preenche automaticamente os campos: criado_por, atualizado_por.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditConfig {

  /**
   * Provedor de auditor atual (usuário logado).
   * Obtém o email/username do usuário autenticado via Spring Security.
   *
   * @return AuditorAware com o nome do usuário logado
   */
  @Bean
  public AuditorAware<String> auditorProvider() {
    return () -> {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

      if (authentication == null || !authentication.isAuthenticated()) {
        return Optional.of("SYSTEM");
      }

      String username = authentication.getName();
      return Optional.ofNullable(username);
    };
  }
}
