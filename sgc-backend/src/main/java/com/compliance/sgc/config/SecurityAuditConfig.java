package com.compliance.sgc.config;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.rolling.RollingFileAppender;
import ch.qos.logback.core.rolling.TimeBasedRollingPolicy;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

/**
 * Configuração de Audit Logging para Eventos de Segurança.
 *
 * Security Hardening (OWASP):
 * - Log de tentativas de login (sucesso e falha)
 * - Log de acessos negados (403)
 * - Log de tentativas de SQL injection
 * - Log de rate limit exceeded
 *
 * @author Security Team
 * @version 1.0
 * @since 2025-11-16
 */
@Configuration
public class SecurityAuditConfig {

  private static final String SECURITY_LOGGER_NAME = "SECURITY_AUDIT";
  private static final String LOG_FILE_PATH = "logs/security-audit.log";

  @PostConstruct
  public void configureSecurityAuditLogger() {
    LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();

    // Criar appender para arquivo de auditoria
    RollingFileAppender<ILoggingEvent> fileAppender = new RollingFileAppender<>();
    fileAppender.setContext(loggerContext);
    fileAppender.setName("SECURITY_AUDIT_FILE");
    fileAppender.setFile(LOG_FILE_PATH);

    // Política de rotação: daily
    TimeBasedRollingPolicy<ILoggingEvent> rollingPolicy = new TimeBasedRollingPolicy<>();
    rollingPolicy.setContext(loggerContext);
    rollingPolicy.setParent(fileAppender);
    rollingPolicy.setFileNamePattern("logs/security-audit-%d{yyyy-MM-dd}.log");
    rollingPolicy.setMaxHistory(90); // Manter 90 dias
    rollingPolicy.start();

    // Encoder JSON format
    PatternLayoutEncoder encoder = new PatternLayoutEncoder();
    encoder.setContext(loggerContext);
    encoder.setPattern(
        "{\"timestamp\":\"%d{yyyy-MM-dd'T'HH:mm:ss.SSSZ}\",\"level\":\"%level\",\"logger\":\"%logger\",\"correlationId\":\"%X{correlationId}\",\"user\":\"%X{user}\",\"ip\":\"%X{ip}\",\"message\":\"%msg\"}%n");
    encoder.start();

    fileAppender.setRollingPolicy(rollingPolicy);
    fileAppender.setEncoder(encoder);
    fileAppender.start();

    // Configurar logger de segurança
    Logger securityLogger = loggerContext.getLogger(SECURITY_LOGGER_NAME);
    securityLogger.addAppender(fileAppender);
    securityLogger.setLevel(Level.INFO);
    securityLogger.setAdditive(false);
  }

  /**
   * Logger para eventos de segurança.
   */
  public static org.slf4j.Logger getSecurityLogger() {
    return LoggerFactory.getLogger(SECURITY_LOGGER_NAME);
  }
}
