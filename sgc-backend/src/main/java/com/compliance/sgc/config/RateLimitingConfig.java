package com.compliance.sgc.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de Rate Limiting usando Bucket4j.
 *
 * Security Hardening:
 * - Login: 5 tentativas / 15 minutos
 * - API calls: 100 requests / minuto por usuário
 * - Busca global: 20 requests / minuto
 *
 * OWASP ASVS 4.0 Level 2 Compliance
 *
 * @author Security Team
 * @version 1.0
 * @since 2025-11-16
 */
@Configuration
public class RateLimitingConfig {

  private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

  /**
   * Rate limit para login: 5 tentativas a cada 15 minutos.
   */
  public Bucket resolveLoginBucket(String key) {
    return cache.computeIfAbsent(
        "login:" + key,
        k ->
            Bucket4j.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15))))
                .build());
  }

  /**
   * Rate limit para API: 100 requests por minuto.
   */
  public Bucket resolveApiBucket(String key) {
    return cache.computeIfAbsent(
        "api:" + key,
        k ->
            Bucket4j.builder()
                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
                .build());
  }

  /**
   * Rate limit para busca: 20 requests por minuto.
   */
  public Bucket resolveSearchBucket(String key) {
    return cache.computeIfAbsent(
        "search:" + key,
        k ->
            Bucket4j.builder()
                .addLimit(Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1))))
                .build());
  }
}
