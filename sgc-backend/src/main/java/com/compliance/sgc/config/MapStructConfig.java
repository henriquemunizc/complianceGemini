package com.compliance.sgc.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração para MapStruct.
 * Garante que os mappers sejam detectados como Spring Beans.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Configuration
@ComponentScan(basePackages = "com.compliance.sgc.mapper")
public class MapStructConfig {
  // Configuração básica - os mappers serão detectados automaticamente
}
