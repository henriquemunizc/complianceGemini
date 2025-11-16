package com.compliance.sgc.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.File;

/**
 * Configuração do Spring Boot Actuator.
 *
 * Health Checks:
 * - Database: verificado automaticamente
 * - Filesystem: espaço em disco disponível
 * - Application: status geral
 *
 * Endpoints:
 * - /actuator/health: público
 * - /actuator/metrics: apenas ADMIN
 *
 * @author Monitoring Team
 * @version 1.0
 * @since 2025-11-16
 */
@Configuration
public class ActuatorConfig {

  /**
   * Health indicator customizado para verificar espaço em disco.
   */
  @Bean
  public HealthIndicator diskSpaceHealthIndicator() {
    return () -> {
      File root = new File("/");
      long freeSpace = root.getFreeSpace();
      long totalSpace = root.getTotalSpace();
      long usableSpace = root.getUsableSpace();

      double percentFree = (double) freeSpace / totalSpace * 100;

      if (percentFree < 10) {
        return Health.down()
            .withDetail("freeSpace", freeSpace)
            .withDetail("totalSpace", totalSpace)
            .withDetail("percentFree", String.format("%.2f%%", percentFree))
            .withDetail("error", "Espaço em disco crítico")
            .build();
      }

      if (percentFree < 20) {
        return Health.up()
            .withDetail("freeSpace", freeSpace)
            .withDetail("totalSpace", totalSpace)
            .withDetail("usableSpace", usableSpace)
            .withDetail("percentFree", String.format("%.2f%%", percentFree))
            .withDetail("warning", "Espaço em disco baixo")
            .build();
      }

      return Health.up()
          .withDetail("freeSpace", freeSpace)
          .withDetail("totalSpace", totalSpace)
          .withDetail("usableSpace", usableSpace)
          .withDetail("percentFree", String.format("%.2f%%", percentFree))
          .build();
    };
  }
}
