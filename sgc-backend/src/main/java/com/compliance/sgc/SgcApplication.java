package com.compliance.sgc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * SGC - Sistema de Gestão de Compliance
 * Aplicação principal Spring Boot.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@SpringBootApplication
@EnableJpaAuditing
public class SgcApplication {

  public static void main(String[] args) {
    SpringApplication.run(SgcApplication.class, args);
  }
}
